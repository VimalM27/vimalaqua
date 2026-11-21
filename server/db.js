'use strict';
// Thin Supabase (PostgREST + GoTrue admin) client using the SERVICE-ROLE key. Server only.
// The driver can be swapped in tests via setDriver().
const { cfg } = require('./config');

function qs(opts) {
  const p = new URLSearchParams();
  if (opts.select) p.set('select', opts.select);
  for (const [k, v] of Object.entries(opts.filter || {})) p.append(k, v);
  if (opts.order) p.set('order', opts.order);
  if (opts.limit) p.set('limit', String(opts.limit));
  return p.toString();
}
async function call(method, path, body, extra) {
  const res = await fetch(cfg.supabaseUrl + path, {
    method,
    headers: Object.assign({ apikey: cfg.serviceKey, Authorization: 'Bearer ' + cfg.serviceKey, 'Content-Type': 'application/json' }, extra || {}),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) { const err = new Error((data && (data.message || data.error_description || data.msg)) || ('Database error ' + res.status)); err.status = 502; err.db = data; throw err; }
  return { data, res };
}
const rest = {
  async select(table, opts = {}) {
    const { data, res } = await call('GET', `/rest/v1/${table}?${qs(opts)}`, undefined, opts.count ? { Prefer: 'count=exact' } : {});
    let count = null; const cr = res.headers.get('content-range'); if (cr && cr.includes('/')) { const n = cr.split('/')[1]; if (n !== '*') count = Number(n); }
    return { rows: data || [], count };
  },
  async insert(table, row) { const { data } = await call('POST', `/rest/v1/${table}`, row, { Prefer: 'return=representation' }); return Array.isArray(data) ? data[0] : data; },
  async update(table, filter, patch) { const { data } = await call('PATCH', `/rest/v1/${table}?${qs({ filter })}`, patch, { Prefer: 'return=representation' }); return data || []; },
  async upsert(table, row, onConflict) { const { data } = await call('POST', `/rest/v1/${table}?on_conflict=${onConflict}`, row, { Prefer: 'resolution=merge-duplicates,return=representation' }); return Array.isArray(data) ? data[0] : data; },
  async rpc(fn, args) { const { data } = await call('POST', `/rest/v1/rpc/${fn}`, args || {}); return data; },
  async storageUpload(bucket, name, buf, type) {
    const res = await fetch(`${cfg.supabaseUrl}/storage/v1/object/${bucket}/${name}`, { method: 'POST', headers: { apikey: cfg.serviceKey, Authorization: 'Bearer ' + cfg.serviceKey, 'Content-Type': type, 'x-upsert': 'false', 'Cache-Control': 'max-age=31536000' }, body: buf });
    if (!res.ok) { const e = new Error('Upload failed'); e.status = 502; throw e; }
    return `${cfg.supabaseUrl}/storage/v1/object/public/${bucket}/${name}`;
  },
  async authUsers(page = 1, perPage = 200) { const { data } = await call('GET', `/auth/v1/admin/users?page=${page}&per_page=${perPage}`); return data; }
};
let driver = rest;
module.exports = {
  select: (...a) => driver.select(...a), insert: (...a) => driver.insert(...a), update: (...a) => driver.update(...a),
  upsert: (...a) => driver.upsert(...a), storageUpload: (...a) => driver.storageUpload(...a), rpc: (...a) => driver.rpc(...a), authUsers: (...a) => driver.authUsers(...a),
  setDriver(d) { driver = d || rest; }
};
