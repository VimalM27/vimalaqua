'use strict';
const { cfg } = require('./config');

const SECURITY = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'"
};
function applySecurity(res) { for (const [k, v] of Object.entries(SECURITY)) res.setHeader(k, v); }
function json(res, status, body, headers) {
  applySecurity(res); if (headers) for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body));
}
function send(res, status, type, body, headers) {
  applySecurity(res); if (headers) for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.statusCode = status; res.setHeader('Content-Type', type); res.end(body);
}
function redirect(res, to) { applySecurity(res); res.statusCode = 302; res.setHeader('Location', to); res.end(); }
function clientIp(req) {
  // On Vercel, x-forwarded-for is set by the platform edge (client can't spoof the left-most trusted hop).
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || String(req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'unknown');
}
function parseCookies(req) {
  const out = {}; String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return out;
}
async function readJson(req, limit = 1024 * 1024) {
  if (req.body !== undefined && req.body !== null) { if (typeof req.body === 'string') { try { return JSON.parse(req.body || '{}'); } catch (e) { throw httpErr(400, 'Invalid JSON'); } } return req.body; }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(httpErr(413, 'Request too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(httpErr(400, 'Invalid JSON')); } });
    req.on('error', reject);
  });
}
function httpErr(status, message) { const e = new Error(message); e.status = status; e.public = message; return e; }
// Same-origin check for state-changing requests (defence in depth on top of SameSite=Strict + CSRF token).
function originOk(req) {
  const origin = req.headers.origin; const host = req.headers.host;
  if (!origin) { const ref = req.headers.referer; if (!ref) return false; try { return new URL(ref).host === host; } catch (e) { return false; } }
  try { const u = new URL(origin); if (u.host === host) return true; return cfg.allowedOrigins.includes(u.origin); } catch (e) { return false; }
}
module.exports = { json, send, redirect, clientIp, parseCookies, readJson, httpErr, originOk, applySecurity };
