'use strict';
// In-memory stand-in for the Supabase driver (tests only). Supports the filter ops the app uses.
module.exports = function memdb() {
  const t = {}; let seq = 1; const tbl = (n) => (t[n] = t[n] || []);
  const test = (row, col, spec) => {
    const i = spec.indexOf('.'), op = spec.slice(0, i), val = spec.slice(i + 1), v = row[col];
    switch (op) {
      case 'eq': return String(v) === val; case 'neq': return String(v) !== val;
      case 'gte': return String(v) >= val; case 'gt': return String(v) > val; case 'lt': return String(v) < val;
      case 'is': return val === 'null' ? v == null : v != null;
      case 'in': return val.replace(/^\(|\)$/g, '').split(',').includes(String(v));
    } throw new Error('op ' + op);
  };
  const match = (rows, f) => rows.filter(r => Object.entries(f || {}).every(([c, s]) => test(r, c, s)));
  const calls = [];
  const d = {
    _t: t, calls, authUserList: [], rpcImpl: null,
    async select(n, o = {}) {
      let rows = match(tbl(n), o.filter).map(r => ({ ...r }));
      if (o.order) { const [c, dir] = o.order.split('.'); rows.sort((a, b) => (String(a[c]) < String(b[c]) ? -1 : 1) * (dir === 'desc' ? -1 : 1)); }
      const count = rows.length; if (o.limit) rows = rows.slice(0, o.limit); return { rows, count: o.count ? count : null };
    },
    async insert(n, row) { const r = { id: row.id || (n === 'vp_admin_audit_log' || n === 'vp_admin_login_attempts' ? seq++ : require('crypto').randomUUID()), at: new Date().toISOString(), created_at: new Date().toISOString(), last_seen_at: new Date().toISOString(), ...row }; if (n === 'vp_admin_account' && tbl(n).length) throw new Error('owner exists'); tbl(n).push(r); return { ...r }; },
    async update(n, f, p) { const rows = match(tbl(n), f); rows.forEach(r => Object.assign(r, p)); return rows.map(r => ({ ...r })); },
    async upsert(n, row, key) { const ex = tbl(n).find(r => r[key] === row[key]); if (ex) Object.assign(ex, row); else tbl(n).push({ ...row }); return row; },
    async rpc(fn, a) { calls.push([fn, a]); if (d.rpcImpl) return d.rpcImpl(fn, a); return null; },
    async authUsers() { return { users: d.authUserList }; },
    async storageUpload(b, name) { return 'https://example.supabase.co/storage/v1/object/public/' + b + '/' + name; }
  };
  return d;
};
