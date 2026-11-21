'use strict';
// All secrets come from server-side environment variables. Nothing here is ever sent to the browser.
function env(name) { return process.env[name] || ''; }
const cfg = {
  get supabaseUrl() { return env('SUPABASE_URL').replace(/\/+$/, ''); },
  get serviceKey() { return env('SUPABASE_SERVICE_ROLE_KEY'); },
  get secret() { return env('ADMIN_SESSION_SECRET'); },
  // Cookies are Secure unless you explicitly run locally over http with ADMIN_DEV=1.
  get dev() { return env('ADMIN_DEV') === '1'; },
  get allowedOrigins() {
    const list = env('ADMIN_ALLOWED_ORIGINS').split(',').map(s => s.trim()).filter(Boolean);
    return list;   // e.g. https://vimal27.in,https://www.vimal27.in
  },
  SESSION_ABSOLUTE_MS: 12 * 3600 * 1000,   // hard stop after 12h
  SESSION_IDLE_MS: 2 * 3600 * 1000,        // log out after 2h without activity
  MAX_SESSIONS: 5,
  IP_FAIL_LIMIT: 5, IP_WINDOW_MS: 15 * 60 * 1000,
  ID_FAIL_LIMIT: 10, ID_WINDOW_MS: 15 * 60 * 1000,
};
function assertConfigured() {
  const miss = [];
  if (!cfg.supabaseUrl) miss.push('SUPABASE_URL');
  if (!cfg.serviceKey) miss.push('SUPABASE_SERVICE_ROLE_KEY');
  if (cfg.secret.length < 32) miss.push('ADMIN_SESSION_SECRET (>= 32 chars)');
  if (miss.length) { const e = new Error('Server not configured: ' + miss.join(', ')); e.status = 500; e.public = 'Admin portal is not configured.'; throw e; }
}
module.exports = { cfg, assertConfigured };
