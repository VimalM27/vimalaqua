'use strict';
// Reads the site's existing product catalogue (js/products-data.js) on the server. Read-only; not duplicated.
const fs = require('fs'), path = require('path'), vm = require('vm');
let cache = null;
function load() {
  if (cache) return cache;
  const candidates = [path.join(process.cwd(), 'js', 'products-data.js'), path.join(__dirname, '..', 'js', 'products-data.js')];
  for (const p of candidates) {
    try { const sandbox = { window: {} }; vm.runInNewContext(fs.readFileSync(p, 'utf8'), sandbox, { timeout: 2000 }); const list = sandbox.window.VPW_PRODUCTS; if (Array.isArray(list)) return (cache = list); } catch (e) { /* try next */ }
  }
  return (cache = []);
}
module.exports = { load, reset() { cache = null; }, set(l) { cache = l; } };
