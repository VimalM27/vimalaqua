'use strict';
process.env.SUPABASE_URL = 'https://example.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc'; process.env.ADMIN_SESSION_SECRET = 's'.repeat(40); process.env.ADMIN_DEV = '1';
const http = require('http'), assert = require('assert');
const db = require('../server/db'), C = require('../server/crypto'), mem = require('./memdb')();
db.setDriver(mem);
require('../server/catalog').set([{ slug: 'chew-bone', name: 'Chew Bone', category: 'Toys', type: 'pet', price: 199, images: ['x.svg'] }]);
const { handle } = require('../server/router');
const server = http.createServer(handle);
let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); } };

function req(method, path, { body, cookie, csrf, headers = {}, ip = '1.1.1.1', origin = true } = {}) {
  return new Promise((resolve, reject) => {
    const port = server.address().port; const data = body === undefined ? null : JSON.stringify(body);
    const h = Object.assign({ 'x-forwarded-for': ip, host: 'localhost:' + port }, headers);
    if (origin) h.origin = 'http://localhost:' + port; if (cookie) h.cookie = cookie; if (csrf) h['x-csrf-token'] = csrf;
    if (data) { h['content-type'] = 'application/json'; h['content-length'] = Buffer.byteLength(data); }
    const r = http.request({ port, method, path, headers: h }, (res) => { let b = ''; res.on('data', c => b += c); res.on('end', () => { let j = null; try { j = JSON.parse(b); } catch (e) {} resolve({ status: res.statusCode, json: j, text: b, headers: res.headers }); }); });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}
const PW = 'Tr0pical-Mango-Sunrise!42';
async function loginOk() {
  const r = await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW } });
  assert.equal(r.status, 200, r.text); return { cookie: r.headers['set-cookie'][0].split(';')[0], csrf: r.json.csrf, raw: r.headers['set-cookie'][0] };
}

(async () => {
  await new Promise(r => server.listen(0, r));
  mem._t.vp_admin_account = [{ id: 1, username: 'owner', email: 'owner@vimal27.in', password_hash: await C.hashPassword(PW) }];

  console.log('AUTHENTICATION');
  await t('protected API rejects anonymous requests (every route)', async () => {
    for (const p of ['dashboard', 'products', 'orders', 'customers', 'categories', 'payments', 'sellers', 'settings', 'toys-page', 'toys-page/preview', 'me']) {
      const r = await req('GET', '/api/admin/' + p); assert.equal(r.status, 401, p + ' => ' + r.status);
    }
    for (const [m, p] of [['POST', 'logout'], ['POST', 'upload'], ['PUT', 'toys-page'], ['POST', 'toys-page/publish'], ['POST', 'orders/status'], ['POST', 'settings/password']]) {
      const r = await req(m, '/api/admin/' + p, { body: {} }); assert.equal(r.status, 401, p);
    }
  });
  await t('every /admin page redirects anonymous users to /admin/login', async () => {
    for (const p of ['', 'products', 'orders', 'customers', 'categories', 'toys-page', 'payments', 'sellers', 'settings', 'assets/admin.js', 'assets/admin.css']) {
      const r = await req('GET', '/api/admin/page?p=' + p); assert.equal(r.status, 302, p); assert.equal(r.headers.location, '/admin/login');
    }
    assert.equal((await req('GET', '/api/admin/page?p=login')).status, 200);
  });
  await t('wrong password, wrong user: same generic error, 401', async () => {
    const a = await req('POST', '/api/admin/login', { body: { username: 'owner', password: 'nope-nope-nope' }, ip: '9.9.9.1' });
    const b = await req('POST', '/api/admin/login', { body: { username: 'ghost', password: 'nope-nope-nope' }, ip: '9.9.9.2' });
    assert.equal(a.status, 401); assert.equal(b.status, 401); assert.equal(a.json.error, b.json.error);
  });
  await t('login by username AND by email works; cookie is HttpOnly + SameSite=Strict', async () => {
    const l = await loginOk(); assert.match(l.raw, /HttpOnly/); assert.match(l.raw, /SameSite=Strict/);
    const e = await req('POST', '/api/admin/login', { body: { username: 'OWNER@vimal27.in', password: PW } }); assert.equal(e.status, 200);
  });
  await t('production cookie is Secure + __Host- prefixed', async () => {
    process.env.ADMIN_DEV = '0'; const r = await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW } }); process.env.ADMIN_DEV = '1';
    const c = r.headers['set-cookie'][0]; assert.match(c, /^__Host-v27_admin=/); assert.match(c, /; Secure/); assert.match(c, /Path=\//);
  });
  await t('only a hash of the session token is stored (never the cookie value)', async () => {
    const l = await loginOk(); const tok = decodeURIComponent(l.cookie.split('=')[1]);
    assert(mem._t.vp_admin_sessions.every(s => s.token_hash !== tok && s.token_hash.length === 64));
  });
  await t('password stored as Argon2id, plaintext never stored', async () => {
    assert.match(mem._t.vp_admin_account[0].password_hash, /^\$argon2id\$/); assert(!JSON.stringify(mem._t).includes(PW));
  });
  await t('brute force: 5 failures lock the IP (429 + Retry-After), even with the right password', async () => {
    for (let i = 0; i < 5; i++) assert.equal((await req('POST', '/api/admin/login', { body: { username: 'owner', password: 'bad-bad-bad-' + i }, ip: '7.7.7.7' })).status, 401);
    const r = await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW }, ip: '7.7.7.7' });
    assert.equal(r.status, 429); assert(r.headers['retry-after']);
    assert.equal((await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW }, ip: '8.8.8.8' })).status, 200);   // other IP still fine
  });
  await t('login from a foreign Origin is rejected (login CSRF)', async () => {
    const r = await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW }, headers: { origin: 'https://evil.example' }, origin: false, ip: '6.6.6.6' }); assert.equal(r.status, 403);
  });

  console.log('SESSIONS, CSRF, LOGOUT');
  const L = await loginOk();
  await t('session works for GET; CSRF token required for writes', async () => {
    assert.equal((await req('GET', '/api/admin/dashboard', { cookie: L.cookie })).status, 200);
    assert.equal((await req('PUT', '/api/admin/toys-page', { cookie: L.cookie, body: {} })).status, 403);                         // no token
    assert.equal((await req('PUT', '/api/admin/toys-page', { cookie: L.cookie, csrf: 'wrong', body: {} })).status, 403);          // bad token
    assert.equal((await req('PUT', '/api/admin/toys-page', { cookie: L.cookie, csrf: L.csrf, body: {} , headers: { origin: 'https://evil.example' }, origin: false })).status, 403); // bad origin
    assert.equal((await req('PUT', '/api/admin/toys-page', { cookie: L.cookie, csrf: L.csrf, body: { content: {} } })).status, 200);
  });
  await t('forged/random session cookie is rejected', async () => { assert.equal((await req('GET', '/api/admin/dashboard', { cookie: 'v27_admin=' + 'a'.repeat(43) })).status, 401); });
  await t('pages and assets are served only with a valid session', async () => {
    for (const p of ['', 'orders', 'toys-page', 'assets/admin.js']) assert.equal((await req('GET', '/api/admin/page?p=' + p, { cookie: L.cookie })).status, 200, p);
    assert.equal((await req('GET', '/api/admin/page?p=login', { cookie: L.cookie })).status, 302);
  });
  await t('idle timeout revokes the session', async () => {
    const x = await loginOk(); const s = mem._t.vp_admin_sessions.find(r => r.token_hash === C.sha256(decodeURIComponent(x.cookie.split('=')[1])));
    s.last_seen_at = new Date(Date.now() - 3 * 3600e3).toISOString(); assert.equal((await req('GET', '/api/admin/me', { cookie: x.cookie })).status, 401);
  });
  await t('absolute expiry revokes the session', async () => {
    const x = await loginOk(); const s = mem._t.vp_admin_sessions.find(r => r.token_hash === C.sha256(decodeURIComponent(x.cookie.split('=')[1])));
    s.expires_at = new Date(Date.now() - 1000).toISOString(); assert.equal((await req('GET', '/api/admin/me', { cookie: x.cookie })).status, 401);
  });
  await t('logout revokes server-side (old cookie dead even if replayed)', async () => {
    const x = await loginOk(); assert.equal((await req('POST', '/api/admin/logout', { cookie: x.cookie, csrf: x.csrf })).status, 200);
    assert.equal((await req('GET', '/api/admin/me', { cookie: x.cookie })).status, 401);
  });
  await t('max 5 concurrent sessions (oldest revoked)', async () => {
    const all = []; for (let i = 0; i < 7; i++) all.push(await loginOk());
    const live = mem._t.vp_admin_sessions.filter(s => !s.revoked_at && Date.parse(s.expires_at) > Date.now()); assert(live.length <= 5, 'live=' + live.length);
  });

  console.log('SINGLE OWNER');
  await t('no public route can create an admin', async () => {
    for (const p of ['register', 'signup', 'create-admin', 'admins', 'init', 'setup']) for (const m of ['POST', 'PUT']) { const r = await req(m, '/api/admin/' + p, { body: { username: 'x', password: PW } }); assert([401, 404].includes(r.status), p + r.status); }
    const X = await loginOk(); for (const p of ['register', 'users', 'admins']) assert.equal((await req('POST', '/api/admin/' + p, { cookie: X.cookie, csrf: X.csrf, body: {} })).status, 404);
    assert.equal(mem._t.vp_admin_account.length, 1);
  });
  await t('second owner insert is refused', async () => { await assert.rejects(() => mem.insert('vp_admin_account', { username: 'b', email: 'b@b.c', password_hash: 'x' })); });

  console.log('DASHBOARD & DATA APIs');
  const A = await loginOk(); const ok = async (m, p, body) => { const r = await req(m, '/api/admin/' + p, { cookie: A.cookie, csrf: A.csrf, body }); return r; };
  const now = new Date().toISOString();
  mem._t.vp_orders = [
    { id: '11111111-1111-4111-8111-111111111111', order_no: 'VM27001', customer_name: 'Asha', total: 500, order_status: 'confirmed', payment_status: 'paid', payment_method: 'upi', created_at: now, paid_at: now, user_id: 'u1' },
    { id: '22222222-2222-4222-8222-222222222222', order_no: 'VM27002', customer_name: 'Ravi', total: 300, order_status: 'pending_payment', payment_status: 'pending', payment_method: 'upi', created_at: now, user_id: 'u1' },
    { id: '33333333-3333-4333-8333-333333333333', order_no: 'VM27003', customer_name: 'Mani', total: 999, order_status: 'pending_payment', payment_status: 'unpaid', payment_method: 'upi', created_at: now }];
  mem._t.vp_order_items = [{ order_id: '11111111-1111-4111-8111-111111111111', name: 'Chew Bone', product_slug: 'chew-bone', qty: 2, line_total: 500 }];
  mem.authUserList = [{ id: 'u1', email: 'a@x.in', created_at: now, user_metadata: { name: 'Asha' } }, { id: 'u2', email: 'b@x.in', created_at: now }];
  await t('dashboard uses real data (revenue = paid only)', async () => {
    const r = await ok('GET', 'dashboard'); assert.equal(r.status, 200); const j = r.json;
    assert.equal(j.revenue.total, 500); assert.equal(j.orders.total, 3); assert.equal(j.orders.pendingPayment, 2); assert.equal(j.orders.awaitingVerification, 1);
    assert.equal(j.customers, 2); assert.equal(j.products.catalogue, 1); assert.equal(j.topProducts[0].name, 'Chew Bone'); assert.equal(j.daily.length, 30); assert.equal(j.monthly.length, 12);
    assert.equal(j.recent.length, 2);
  });
  await t('products / categories / customers / payments / sellers / settings respond', async () => {
    for (const p of ['products', 'categories', 'customers', 'payments', 'sellers', 'settings', 'orders']) { const r = await ok('GET', p); assert.equal(r.status, 200, p + ' ' + r.text); }
    assert.equal((await ok('GET', 'customers')).json.customers.find(c => c.id === 'u1').spent, 500);
    const s = (await ok('GET', 'settings')).json; assert(!JSON.stringify(s).includes('password_hash'));
  });
  await t('order actions call the EXISTING SQL functions with validation', async () => {
    const id = '22222222-2222-4222-8222-222222222222';
    assert.equal((await ok('POST', 'orders/status', { id, status: 'confirmed', note: 'ok' })).status, 200);
    assert.deepEqual(mem.calls.at(-1)[0], 'vp_admin_set_status');
    assert.equal((await ok('POST', 'orders/status', { id: 'bad', status: 'confirmed' })).status, 400);
    assert.equal((await ok('POST', 'orders/status', { id, status: 'hacked' })).status, 400);
    assert.equal((await ok('POST', 'orders/payment', { id, status: 'paid', reference: 'UTR123' })).status, 200);
    mem.rpcImpl = () => { const e = new Error('x'); e.db = { message: 'Payment has not been verified.' }; throw e; };
    const r = await ok('POST', 'orders/status', { id, status: 'confirmed' }); mem.rpcImpl = null; assert.equal(r.status, 400); assert.match(r.json.error, /not been verified/);
  });
  await t('audit log records admin actions', async () => { assert(mem._t.vp_admin_audit_log.some(a => a.action === 'order_status')); assert(mem._t.vp_admin_audit_log.some(a => a.action === 'login_success')); assert(mem._t.vp_admin_audit_log.some(a => a.action === 'login_failed')); });

  console.log('TOYS PAGE CMS');
  await t('save draft -> not public until publish -> publish -> public', async () => {
    const d = (await ok('GET', 'toys-page')).json.draft; d.sections.hero.headingA = 'Hello Toys'; d.order = ['final'].concat(d.order.filter(x => x !== 'final')); d.sections.why.enabled = false;
    assert.equal((await ok('PUT', 'toys-page', { content: d })).status, 200);
    assert.equal(mem._t.vp_page_content[0].published, null);
    const pub = require('../api/toys-content.js'); const call = () => new Promise(r => { const res = { setHeader() {}, end(b) { r(JSON.parse(b)); } }; pub({}, res); });
    assert.equal((await call()).content, null);
    const pr = await ok('POST', 'toys-page/publish', {}); assert.equal(pr.status, 200); const live = await call();
    assert.equal(live.content.sections.hero.headingA, 'Hello Toys'); assert.equal(live.content.order[0], 'final'); assert.equal(live.content.sections.why.enabled, false); assert(!('draft' in live));
  });
  await t('malicious content is sanitised (javascript: URLs, off-site //, unknown sections, bad ids)', async () => {
    const r = await ok('PUT', 'toys-page', { content: { sections: { hero: { image: 'javascript:alert(1)', cta1: { label: 'x', href: 'data:text/html,hi' } }, popular: { mode: 'manual', featured: ['c:ok-slug', '<script>', 's:' + 'x'.repeat(90)] }, evil: { a: 1 } }, order: ['evil', 'hero'] } });
    const c = r.json.content; assert.equal(c.sections.hero.image, 'images/about-toys.jpg'); assert.equal(c.sections.hero.cta1.href, '#popular'); assert.deepEqual(c.sections.popular.featured, ['c:ok-slug']); assert(!c.sections.evil); assert(!c.order.includes('evil'));
  });
  await t('preview returns the DRAFT, only to admin', async () => { assert.equal((await req('GET', '/api/admin/toys-page/preview')).status, 401); assert.equal((await ok('GET', 'toys-page/preview')).status, 200); });
  await t('image upload: accepts real PNG, rejects SVG/HTML/oversize', async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.alloc(50)]).toString('base64');
    const g = await ok('POST', 'upload', { data: png }); assert.equal(g.status, 200); assert.match(g.json.url, /site-media\/toys\/[0-9a-f]{24}\.png$/);
    assert.equal((await ok('POST', 'upload', { data: Buffer.from('<svg onload=alert(1)>').toString('base64') })).status, 400);
    assert.equal((await ok('POST', 'upload', { data: Buffer.from('<html>').toString('base64') })).status, 400);
  });

  console.log('PASSWORD CHANGE');
  await t('change password: needs current pw, enforces policy, revokes other sessions, old pw dies', async () => {
    const other = await loginOk(); const me = await loginOk();
    assert.equal((await req('POST', '/api/admin/settings/password', { cookie: me.cookie, csrf: me.csrf, body: { currentPassword: 'wrong-wrong-1', newPassword: 'Another-Strong-Pass-77' } })).status, 403);
    assert.equal((await req('POST', '/api/admin/settings/password', { cookie: me.cookie, csrf: me.csrf, body: { currentPassword: PW, newPassword: 'short' } })).status, 400);
    assert.equal((await req('POST', '/api/admin/settings/password', { cookie: me.cookie, csrf: me.csrf, body: { currentPassword: PW, newPassword: 'password12345678' } })).status, 400);
    assert.equal((await req('POST', '/api/admin/settings/password', { cookie: me.cookie, csrf: me.csrf, body: { currentPassword: PW, newPassword: 'Another-Strong-Pass-77' } })).status, 200);
    assert.equal((await req('GET', '/api/admin/me', { cookie: other.cookie })).status, 401); assert.equal((await req('GET', '/api/admin/me', { cookie: me.cookie })).status, 200);
    assert.equal((await req('POST', '/api/admin/login', { body: { username: 'owner', password: PW }, ip: '5.5.5.5' })).status, 401);
    assert.equal((await req('POST', '/api/admin/login', { body: { username: 'owner', password: 'Another-Strong-Pass-77' }, ip: '5.5.5.5' })).status, 200);
  });
  await t('unconfigured server fails closed', async () => { const k = process.env.ADMIN_SESSION_SECRET; process.env.ADMIN_SESSION_SECRET = 'short'; const r = await req('GET', '/api/admin/dashboard'); process.env.ADMIN_SESSION_SECRET = k; assert.equal(r.status, 500); });

  server.close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
