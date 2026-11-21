'use strict';
const fs = require('fs'), path = require('path');
const { cfg, assertConfigured } = require('./config');
const db = require('./db');
const A = require('./auth');
const H = require('./http');
const cms = require('./cms');
const catalog = require('./catalog');
const { httpErr } = H;

const DAY = 86400000, iso = (ms) => new Date(ms).toISOString();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_STATUS = ['pending_payment', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refund_pending', 'refunded'];
const PAY_STATUS = ['unpaid', 'pending', 'paid', 'failed', 'refund_pending', 'refunded'];
const num = (v) => Number(v) || 0;
const uuid = (v) => { if (!UUID.test(String(v || ''))) throw httpErr(400, 'Invalid id'); return String(v); };
const text = (v, max) => String(v == null ? '' : v).slice(0, max);

// RPC errors raised by your own SQL functions are user-facing business rules -> show them.
async function rpc(fn, args) { try { return await db.rpc(fn, args); } catch (e) { if (e.db && e.db.message) throw httpErr(400, e.db.message); throw e; } }

// ---------------------------------------------------------------- dashboard
async function dashboard() {
  const orders = (await db.select('vp_orders', { select: 'id,order_no,customer_name,total,order_status,payment_status,payment_method,payment_reference,created_at,paid_at', order: 'created_at.desc', limit: 20000 })).rows;
  const now = Date.now(), monthKey = (t) => new Date(t).toISOString().slice(0, 7);
  const paid = orders.filter(o => o.payment_status === 'paid');
  const rev = paid.reduce((s, o) => s + num(o.total), 0);
  const thisM = monthKey(now), lastM = monthKey(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() - 1, 15));
  const revBy = (key) => paid.filter(o => monthKey(Date.parse(o.paid_at || o.created_at)) === key).reduce((s, o) => s + num(o.total), 0);
  const byStatus = {}; orders.forEach(o => { byStatus[o.order_status] = (byStatus[o.order_status] || 0) + 1; });

  const daily = []; for (let i = 29; i >= 0; i--) { const d = new Date(now - i * DAY).toISOString().slice(0, 10); daily.push({ date: d, revenue: 0, orders: 0 }); }
  const di = Object.fromEntries(daily.map((d, i) => [d.date, i]));
  orders.forEach(o => { const c = di[String(o.created_at).slice(0, 10)]; if (c !== undefined) daily[c].orders++; });
  paid.forEach(o => { const c = di[String(o.paid_at || o.created_at).slice(0, 10)]; if (c !== undefined) daily[c].revenue += num(o.total); });
  const monthly = []; for (let i = 11; i >= 0; i--) { const d = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() - i, 15)); monthly.push({ month: d.toISOString().slice(0, 7), revenue: 0 }); }
  const mi = Object.fromEntries(monthly.map((m, i) => [m.month, i]));
  paid.forEach(o => { const c = mi[monthKey(Date.parse(o.paid_at || o.created_at))]; if (c !== undefined) monthly[c].revenue += num(o.total); });

  // top products from the 100 most recent paid orders
  let top = [];
  const ids = paid.slice(0, 100).map(o => o.id);
  if (ids.length) {
    const items = (await db.select('vp_order_items', { select: 'name,qty,line_total,product_slug', filter: { order_id: 'in.(' + ids.join(',') + ')' }, limit: 2000 })).rows;
    const m = {}; items.forEach(i => { const k = i.product_slug || i.name; (m[k] = m[k] || { name: i.name, qty: 0, revenue: 0 }); m[k].qty += num(i.qty); m[k].revenue += num(i.line_total); });
    top = Object.values(m).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }
  const partner = await db.select('products', { select: 'id', count: true, limit: 1 }).catch(() => ({ count: 0 }));
  let customers = 0;
  try { for (let p = 1; p <= 25; p++) { const r = await db.authUsers(p, 200); const n = (r.users || []).length; customers += n; if (n < 200) break; } } catch (e) { customers = null; }
  const cat = catalog.load();
  return {
    revenue: { total: rev, thisMonth: revBy(thisM), lastMonth: revBy(lastM) },
    orders: { total: orders.length, pendingPayment: byStatus.pending_payment || 0, awaitingVerification: orders.filter(o => o.payment_status === 'pending').length,
      inProgress: (byStatus.confirmed || 0) + (byStatus.processing || 0) + (byStatus.shipped || 0) + (byStatus.out_for_delivery || 0), delivered: byStatus.delivered || 0, byStatus },
    products: { catalogue: cat.length, partner: partner.count || 0, total: cat.length + (partner.count || 0) },
    customers, daily, monthly, topProducts: top,
    recent: orders.filter(o => o.payment_status !== 'unpaid').slice(0, 8)
  };
}

// ---------------------------------------------------------------- products / categories
async function productsList() {
  const cat = catalog.load().map(p => ({ key: 'c:' + p.slug, slug: p.slug, name: p.name, category: p.category, type: p.type, price: p.price, image: (p.images || [])[0] || '', source: 'catalogue' }));
  let partner = [];
  try {
    const shops = Object.fromEntries((await db.select('profiles', { select: 'id,shop_name' , limit: 2000 })).rows.map(s => [s.id, s.shop_name]));
    partner = (await db.select('products', { select: '*', order: 'created_at.desc', limit: 1000 })).rows.map(p => ({ key: 's:' + p.id, id: p.id, name: p.product_name, category: p.category, price: num(p.price), stock: p.stock, image: p.image_url || '', active: p.is_active !== false, shop: shops[p.shop_owner_id] || '—', created_at: p.created_at, source: 'partner' }));
  } catch (e) { /* partner tables optional */ }
  return { catalogue: cat, partner };
}
async function categoriesList() {
  const p = await productsList(); const tally = (arr) => Object.entries(arr.reduce((m, x) => { const k = x.category || 'Uncategorised'; m[k] = (m[k] || 0) + 1; return m; }, {})).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  const row = (await db.select('vp_page_content', { select: 'published', filter: { page_key: 'eq.toys' }, limit: 1 })).rows[0];
  const content = row && row.published ? cms.sanitize(row.published) : cms.defaults();
  return { catalogue: tally(p.catalogue), partner: tally(p.partner), toysPageCategories: content.sections.categories.items };
}

// ---------------------------------------------------------------- orders / payments / customers / sellers
async function ordersList(q) {
  const filter = {}; if (q.status && ORDER_STATUS.includes(q.status)) filter.order_status = 'eq.' + q.status; if (q.payment && PAY_STATUS.includes(q.payment)) filter.payment_status = 'eq.' + q.payment;
  let rows = (await db.select('vp_orders', { select: '*', filter, order: 'created_at.desc', limit: 300 })).rows;
  if (q.q) { const s = String(q.q).toLowerCase().slice(0, 80); rows = rows.filter(o => [o.order_no, o.customer_name, o.phone, o.email, o.payment_reference].join(' ').toLowerCase().includes(s)); }
  return { orders: rows, statuses: ORDER_STATUS, paymentStatuses: PAY_STATUS };
}
async function orderDetail(id) {
  uuid(id);
  const o = (await db.select('vp_orders', { select: '*', filter: { id: 'eq.' + id }, limit: 1 })).rows[0]; if (!o) throw httpErr(404, 'Order not found');
  const items = (await db.select('vp_order_items', { select: '*', filter: { order_id: 'eq.' + id } })).rows;
  const events = (await db.select('vp_order_events', { select: '*', filter: { order_id: 'eq.' + id }, order: 'created_at.asc' })).rows;
  const requests = (await db.select('vp_order_requests', { select: '*', filter: { order_id: 'eq.' + id }, order: 'created_at.desc' })).rows;
  return { order: o, items, events, requests };
}
async function customersList() {
  let users = []; for (let p = 1; p <= 5; p++) { const r = await db.authUsers(p, 200); const u = r.users || []; users = users.concat(u); if (u.length < 200) break; }
  const orders = (await db.select('vp_orders', { select: 'user_id,total,payment_status', limit: 20000 })).rows; const agg = {};
  orders.forEach(o => { if (!o.user_id) return; const a = (agg[o.user_id] = agg[o.user_id] || { orders: 0, spent: 0 }); a.orders++; if (o.payment_status === 'paid') a.spent += num(o.total); });
  return { customers: users.map(u => ({ id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || '', phone: (u.user_metadata && u.user_metadata.phone) || u.phone || '', created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, orders: (agg[u.id] || {}).orders || 0, spent: (agg[u.id] || {}).spent || 0 })).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))) };
}
async function paymentsList() {
  const orders = (await db.select('vp_orders', { select: 'id,order_no,customer_name,total,payment_method,payment_status,payment_reference,paid_at,created_at,order_status', filter: { payment_status: 'neq.unpaid' }, order: 'created_at.desc', limit: 300 })).rows;
  const sums = {}; orders.forEach(o => { sums[o.payment_status] = (sums[o.payment_status] || 0) + num(o.total); });
  let subs = []; try { const shops = Object.fromEntries((await db.select('profiles', { select: 'id,shop_name', limit: 2000 })).rows.map(s => [s.id, s.shop_name])); subs = (await db.select('payments', { select: '*', order: 'paid_at.desc', limit: 200 })).rows.map(p => Object.assign({}, p, { shop: shops[p.shop_owner_id] || '—' })); } catch (e) { /* optional */ }
  return { orders, sums, sellerSubscriptions: subs };
}
async function sellersList() {
  const profiles = (await db.select('profiles', { select: '*', order: 'created_at.desc', limit: 1000 })).rows;
  let applications = []; try { applications = (await db.select('seller_applications', { select: '*', order: 'created_at.desc', limit: 500 })).rows; } catch (e) { /* table may not exist */ }
  return { profiles, applications };
}
async function settingsInfo(session) {
  const a0 = (await db.select('vp_admin_account', { select: 'username,email,password_changed_at,created_at', limit: 1 })).rows[0] || {};
  const acct = { username: a0.username, email: a0.email, password_changed_at: a0.password_changed_at, created_at: a0.created_at };   // explicit allow-list: never the hash
  const sessions = (await db.select('vp_admin_sessions', { select: 'id,created_at,last_seen_at,expires_at,ip,user_agent', filter: { revoked_at: 'is.null', expires_at: 'gt.' + iso(Date.now()) }, order: 'created_at.desc' })).rows.map(s => Object.assign({}, s, { current: s.id === session.id }));
  const audit = (await db.select('vp_admin_audit_log', { select: '*', order: 'at.desc', limit: 60 })).rows;
  const attempts = (await db.select('vp_admin_login_attempts', { select: 'at,ip,success,user_agent', order: 'at.desc', limit: 40 })).rows;
  return { account: acct, sessions, audit, attempts };
}

// ---------------------------------------------------------------- Toys CMS
async function cmsRow() { return (await db.select('vp_page_content', { select: '*', filter: { page_key: 'eq.toys' }, limit: 1 })).rows[0] || null; }
async function toysGet() {
  const r = await cmsRow();
  const draft = cms.sanitize(r && r.draft && Object.keys(r.draft).length ? r.draft : (r && r.published) || {});
  const published = r && r.published ? cms.sanitize(r.published) : null;
  return { draft, published, defaults: cms.defaults(), version: r ? r.version : 0, updatedAt: r ? r.updated_at : null, publishedAt: r ? r.published_at : null, hasUnpublished: !!r && JSON.stringify(draft) !== JSON.stringify(published || cms.sanitize({})) };
}
async function toysSave(body) {
  const content = cms.sanitize(body && body.content); const r = await cmsRow();
  await db.upsert('vp_page_content', { page_key: 'toys', draft: content, published: r ? r.published : null, version: r ? r.version : 0, updated_at: iso(Date.now()) }, 'page_key');
  return content;
}
async function toysPublish() {
  const r = await cmsRow(); const content = cms.sanitize(r && r.draft && Object.keys(r.draft).length ? r.draft : {});
  await db.upsert('vp_page_content', { page_key: 'toys', draft: content, published: content, version: (r ? r.version : 0) + 1, updated_at: iso(Date.now()), published_at: iso(Date.now()) }, 'page_key');
  return { version: (r ? r.version : 0) + 1 };
}
async function toysDiscard(reset) {
  const r = await cmsRow(); const base = reset ? cms.defaults() : (r && r.published) || cms.defaults();
  await db.upsert('vp_page_content', { page_key: 'toys', draft: cms.sanitize(base), published: r ? r.published : null, version: r ? r.version : 0, updated_at: iso(Date.now()) }, 'page_key');
}
const MAGIC = [['image/jpeg', 'jpg', [0xFF, 0xD8, 0xFF]], ['image/png', 'png', [0x89, 0x50, 0x4E, 0x47]], ['image/gif', 'gif', [0x47, 0x49, 0x46, 0x38]]];
async function upload(body) {
  const buf = Buffer.from(String(body.data || ''), 'base64'); if (!buf.length) throw httpErr(400, 'No file'); if (buf.length > 3 * 1024 * 1024) throw httpErr(413, 'Image must be under 3 MB');
  let kind = MAGIC.find(m => m[2].every((b, i) => buf[i] === b));
  if (!kind && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') kind = ['image/webp', 'webp'];
  if (!kind) throw httpErr(400, 'Only JPG, PNG, GIF or WebP images are allowed');
  const name = 'toys/' + require('crypto').randomBytes(12).toString('hex') + '.' + kind[1];
  const url = await db.storageUpload('site-media', name, buf, kind[0]); return { url };
}

// ---------------------------------------------------------------- dispatcher
const ENUM = (v, list, label) => { if (!list.includes(v)) throw httpErr(400, 'Invalid ' + label); return v; };
async function api(req, res, route, q) {
  const seg = route.split('/').filter(Boolean), m = req.method, key = m + ' ' + seg[0];

  if (key === 'POST login') { const body = await H.readJson(req, 4096); const r = await A.login(req, body); return H.json(res, 200, { ok: true, csrf: r.csrf, username: r.username, email: r.email }, { 'Set-Cookie': r.setCookie }); }
  if (key === 'GET session') { const s = await A.currentSession(req); if (!s) return H.json(res, 401, { error: 'Not signed in' }); return H.json(res, 200, { ok: true, csrf: s.csrf, expiresAt: s.expires_at }); }

  const s = await A.requireAdmin(req);               // everything below needs a valid session (+ CSRF for writes)
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m) ? await H.readJson(req, 6 * 1024 * 1024) : {};
  const ok = (data) => H.json(res, 200, Object.assign({ ok: true }, data || {}));
  const log = (action, detail) => A.audit(req, action, detail);

  switch (key) {
    case 'POST logout': return H.json(res, 200, { ok: true }, { 'Set-Cookie': await A.logout(req, s) });
    case 'GET me': { const a = (await db.select('vp_admin_account', { select: 'username,email', limit: 1 })).rows[0] || {}; return ok({ username: a.username, email: a.email, csrf: s.csrf }); }
    case 'GET dashboard': return ok(await dashboard());
    case 'GET products': return ok(await productsList());
    case 'POST products': {
      if (seg[1] !== 'visibility') break; const id = uuid(body.id), active = body.active === true;
      const r = await db.update('products', { id: 'eq.' + id }, { is_active: active }); await log('product_visibility', { id, active }); return ok({ updated: r.length });
    }
    case 'GET categories': return ok(await categoriesList());
    case 'GET orders': return seg[1] ? ok(await orderDetail(seg[1])) : ok(await ordersList(q));
    case 'POST orders': {
      const id = uuid(body.id);
      if (seg[1] === 'status') { await rpc('vp_admin_set_status', { p_order: id, p_status: ENUM(body.status, ORDER_STATUS, 'status'), p_note: text(body.note, 500) || null }); await log('order_status', { id, status: body.status }); return ok(); }
      if (seg[1] === 'payment') { await rpc('vp_admin_set_payment', { p_order: id, p_status: ENUM(body.status, PAY_STATUS, 'payment status'), p_reference: text(body.reference, 120) || null, p_note: text(body.note, 500) || null }); await log('order_payment', { id, status: body.status }); return ok(); }
      if (seg[1] === 'tracking') { await rpc('vp_admin_set_tracking', { p_order: id, p_carrier: text(body.carrier, 80), p_number: text(body.number, 80), p_url: text(body.url, 300) || null, p_eta: /^\d{4}-\d{2}-\d{2}$/.test(body.eta || '') ? body.eta : null }); await log('order_tracking', { id }); return ok(); }
      if (seg[1] === 'note') { await rpc('vp_admin_add_note', { p_order: id, p_note: text(body.note, 500), p_visible: body.visible === true }); await log('order_note', { id }); return ok(); }
      break;
    }
    case 'GET customers': return ok(await customersList());
    case 'GET payments': return ok(await paymentsList());
    case 'GET sellers': return ok(await sellersList());
    case 'POST sellers': {
      if (seg[1] !== 'application-status') break; const id = uuid(body.id), status = text(body.status, 30);
      if (!/^[a-z_]{3,30}$/.test(status)) throw httpErr(400, 'Invalid status');
      await rpc('update_seller_status', { application_id: id, new_status: status, admin_note: text(body.note, 500) || null }); await log('seller_status', { id, status }); return ok();
    }
    case 'GET settings': return ok(await settingsInfo(s));
    case 'POST settings': {
      if (seg[1] === 'password') { const n = await A.changePassword(req, s, body); return ok({ otherSessionsRevoked: n }); }
      if (seg[1] === 'revoke-others') { const n = await A.revokeAllExcept(s); await log('sessions_revoked', { count: n }); return ok({ revoked: n }); }
      break;
    }
    case 'GET toys-page': if (seg[1] === 'preview') return ok({ content: (await toysGet()).draft }); return ok(await toysGet());
    case 'PUT toys-page': { const c = await toysSave(body); await log('cms_save', {}); return ok({ content: c }); }
    case 'POST toys-page': {
      if (seg[1] === 'publish') { const r = await toysPublish(); await log('cms_publish', r); return ok(r); }
      if (seg[1] === 'discard') { await toysDiscard(false); await log('cms_discard', {}); return ok(await toysGet()); }
      if (seg[1] === 'reset') { await toysDiscard(true); await log('cms_reset', {}); return ok(await toysGet()); }
      break;
    }
    case 'POST upload': { const r = await upload(body); await log('upload', { url: r.url }); return ok(r); }
  }
  throw httpErr(404, 'Not found');
}

// ---------------------------------------------------------------- pages (server-side protected)
const UI = path.join(__dirname, 'admin-ui');
const PAGES = new Set(['', 'products', 'orders', 'customers', 'categories', 'toys-page', 'payments', 'sellers', 'settings']);
const PUBLIC_ASSETS = { 'assets/login.js': 'text/javascript; charset=utf-8', 'assets/login.css': 'text/css; charset=utf-8' };
const PRIVATE_ASSETS = { 'assets/admin.js': 'text/javascript; charset=utf-8', 'assets/admin.css': 'text/css; charset=utf-8' };
const readUi = (f) => { for (const d of [UI, path.join(process.cwd(), 'server', 'admin-ui')]) { try { return fs.readFileSync(path.join(d, f)); } catch (e) { /* next */ } } throw httpErr(500, 'UI missing'); };
async function page(req, res, p) {
  p = String(p || '').replace(/^\/+|\/+$/g, '');
  if (!['GET', 'HEAD'].includes(req.method)) throw httpErr(405, 'Method not allowed');
  if (PUBLIC_ASSETS[p]) return H.send(res, 200, PUBLIC_ASSETS[p], readUi(p.replace('assets/', '')), { 'Cache-Control': 'public, max-age=300' });
  const sess = await A.currentSession(req);
  if (p === 'login') { if (sess) return H.redirect(res, '/admin'); return H.send(res, 200, 'text/html; charset=utf-8', readUi('login.html')); }
  if (!sess) { if (PRIVATE_ASSETS[p] || PAGES.has(p)) return H.redirect(res, '/admin/login'); return H.redirect(res, '/admin/login'); }
  if (PRIVATE_ASSETS[p]) return H.send(res, 200, PRIVATE_ASSETS[p], readUi(p.replace('assets/', '')));
  if (PAGES.has(p)) return H.send(res, 200, 'text/html; charset=utf-8', readUi('app.html'));
  return H.send(res, 404, 'text/plain; charset=utf-8', 'Not found');
}

// ---------------------------------------------------------------- entry
async function handle(req, res) {
  try {
    const u = new URL(req.url, 'http://x'); let route = u.pathname.replace(/^\/api\/admin\/?/, '');
    if (route === 'page') return await page(req, res, u.searchParams.get('p'));
    assertConfigured();
    return await api(req, res, route, Object.fromEntries(u.searchParams));
  } catch (e) {
    const status = e.status && e.status < 600 ? e.status : 500;
    if (status >= 500) console.error('[admin]', e && e.message);
    const headers = e.retryAfter ? { 'Retry-After': String(e.retryAfter) } : undefined;
    const msg = e.public || (status === 401 ? 'Not signed in' : status === 502 ? 'Database error' : 'Something went wrong');
    if (!res.headersSent) H.json(res, status, { error: msg }, headers);
  }
}
module.exports = { handle };
