'use strict';
const { cfg, assertConfigured } = require('./config');
const db = require('./db');
const C = require('./crypto');
const { clientIp, parseCookies, httpErr, originOk } = require('./http');

const COOKIE = () => (cfg.dev ? 'v27_admin' : '__Host-v27_admin');
const ua = (req) => String(req.headers['user-agent'] || '').slice(0, 300);
const iso = (ms) => new Date(ms).toISOString();

function cookieHeader(value, maxAgeSec) {
  const parts = [`${COOKIE()}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSec}`];
  if (!cfg.dev) parts.push('Secure');
  return parts.join('; ');
}
const clearCookie = () => cookieHeader('', 0);

async function audit(req, action, detail) {
  try { await db.insert('vp_admin_audit_log', { action, ip: req ? clientIp(req) : null, user_agent: req ? ua(req) : null, detail: detail || {} }); } catch (e) { /* never block on audit failure */ }
}

// ---- brute-force protection --------------------------------------------------
async function checkRateLimit(req, identifier) {
  const ip = clientIp(req), idh = C.hmac('id', String(identifier || '').trim().toLowerCase());
  const since = (w) => iso(Date.now() - w);
  const byIp = await db.select('vp_admin_login_attempts', { select: 'id', filter: { ip: 'eq.' + ip, success: 'eq.false', at: 'gte.' + since(cfg.IP_WINDOW_MS) }, limit: 50 });
  const byId = await db.select('vp_admin_login_attempts', { select: 'id', filter: { identifier_hash: 'eq.' + idh, success: 'eq.false', at: 'gte.' + since(cfg.ID_WINDOW_MS) }, limit: 50 });
  if (byIp.rows.length >= cfg.IP_FAIL_LIMIT || byId.rows.length >= cfg.ID_FAIL_LIMIT) {
    const e = httpErr(429, 'Too many failed attempts. Please wait 15 minutes and try again.'); e.retryAfter = Math.ceil(cfg.IP_WINDOW_MS / 1000); throw e;
  }
  return { ip, idh };
}
async function recordAttempt(req, ip, idh, success) { await db.insert('vp_admin_login_attempts', { ip, identifier_hash: idh, success, user_agent: ua(req) }); }

// ---- login / session ---------------------------------------------------------
async function login(req, body) {
  assertConfigured();
  if (!originOk(req)) throw httpErr(403, 'Forbidden');
  const identifier = String((body && body.username) || '').trim(); const password = String((body && body.password) || '');
  if (!identifier || !password || identifier.length > 200 || password.length > 400) throw httpErr(400, 'Enter your username/email and password.');
  const { ip, idh } = await checkRateLimit(req, identifier);

  const acct = (await db.select('vp_admin_account', { select: '*', limit: 1 })).rows[0];
  const match = acct && (acct.username.toLowerCase() === identifier.toLowerCase() || acct.email.toLowerCase() === identifier.toLowerCase());
  const ok = await C.verifyPassword(match ? acct.password_hash : await C.dummyHash(), password) && !!match;
  await recordAttempt(req, ip, idh, ok);
  if (!ok) { await audit(req, 'login_failed', {}); throw httpErr(401, 'Incorrect username/email or password.'); }

  // limit concurrent sessions: revoke the oldest beyond MAX_SESSIONS-1
  const live = (await db.select('vp_admin_sessions', { select: 'id,created_at', filter: { revoked_at: 'is.null', expires_at: 'gt.' + iso(Date.now()) }, order: 'created_at.asc' })).rows;
  for (const s of live.slice(0, Math.max(0, live.length - (cfg.MAX_SESSIONS - 1)))) await db.update('vp_admin_sessions', { id: 'eq.' + s.id }, { revoked_at: iso(Date.now()) });

  const token = C.newToken();
  const row = await db.insert('vp_admin_sessions', { token_hash: C.sha256(token), expires_at: iso(Date.now() + cfg.SESSION_ABSOLUTE_MS), ip, user_agent: ua(req) });
  await audit(req, 'login_success', { session: row.id });
  return { setCookie: cookieHeader(token, Math.floor(cfg.SESSION_ABSOLUTE_MS / 1000)), csrf: C.hmac('csrf', row.id), email: acct.email, username: acct.username };
}

async function currentSession(req) {
  assertConfigured();
  const tok = parseCookies(req)[COOKIE()];
  if (!tok || tok.length < 20 || tok.length > 200) return null;
  const s = (await db.select('vp_admin_sessions', { select: '*', filter: { token_hash: 'eq.' + C.sha256(tok) }, limit: 1 })).rows[0];
  if (!s || s.revoked_at) return null;
  const now = Date.now();
  if (Date.parse(s.expires_at) <= now || now - Date.parse(s.last_seen_at) > cfg.SESSION_IDLE_MS) { await db.update('vp_admin_sessions', { id: 'eq.' + s.id }, { revoked_at: iso(now) }); return null; }
  if (now - Date.parse(s.last_seen_at) > 60000) await db.update('vp_admin_sessions', { id: 'eq.' + s.id }, { last_seen_at: iso(now) });
  return Object.assign({}, s, { csrf: C.hmac('csrf', s.id) });
}

// Throws 401 if not logged in; for non-GET also enforces Origin + CSRF token.
async function requireAdmin(req) {
  const s = await currentSession(req);
  if (!s) throw httpErr(401, 'Not signed in');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!originOk(req)) throw httpErr(403, 'Forbidden');
    if (!C.safeEqual(req.headers['x-csrf-token'] || '', s.csrf)) throw httpErr(403, 'Invalid CSRF token');
  }
  return s;
}

async function logout(req, session) {
  if (session) await db.update('vp_admin_sessions', { id: 'eq.' + session.id }, { revoked_at: iso(Date.now()) });
  await audit(req, 'logout', {});
  return clearCookie();
}
async function revokeAllExcept(session) {
  const live = (await db.select('vp_admin_sessions', { select: 'id', filter: { revoked_at: 'is.null' } })).rows;
  let n = 0; for (const s of live) if (!session || s.id !== session.id) { await db.update('vp_admin_sessions', { id: 'eq.' + s.id }, { revoked_at: iso(Date.now()) }); n++; }
  return n;
}
async function changePassword(req, session, body) {
  const cur = String(body.currentPassword || ''), next = String(body.newPassword || '');
  const acct = (await db.select('vp_admin_account', { select: '*', limit: 1 })).rows[0];
  const { ip, idh } = await checkRateLimit(req, 'pwchange');
  if (!acct || !(await C.verifyPassword(acct.password_hash, cur))) { await recordAttempt(req, ip, idh, false); await audit(req, 'password_change_failed', {}); throw httpErr(403, 'Current password is incorrect.'); }
  const problem = C.passwordProblem(next, acct); if (problem) throw httpErr(400, problem);
  if (await C.verifyPassword(acct.password_hash, next)) throw httpErr(400, 'New password must be different from the current one.');
  await db.update('vp_admin_account', { id: 'eq.1' }, { password_hash: await C.hashPassword(next), password_changed_at: iso(Date.now()) });
  const revoked = await revokeAllExcept(session);
  await audit(req, 'password_changed', { otherSessionsRevoked: revoked });
  return revoked;
}
module.exports = { login, currentSession, requireAdmin, logout, revokeAllExcept, changePassword, audit, clearCookie, COOKIE };
