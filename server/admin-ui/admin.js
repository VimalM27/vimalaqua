(function () {
  'use strict';
  var csrf = '', $ = function (s, r) { return (r || document).querySelector(s); }, view = $('#view');
  var NAV = [['/admin', 'Dashboard', '▦'], ['/admin/products', 'Products', '◈'], ['/admin/orders', 'Orders', '▤'], ['/admin/customers', 'Customers', '☺'], ['/admin/categories', 'Categories', '☰'], ['/admin/toys-page', 'Toys Page', '✦'], ['/admin/payments', 'Payments', '₹'], ['/admin/sellers', 'Sellers', '⌂'], ['/admin/settings', 'Settings', '⚙']];
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
  function dt(s) { if (!s) return '—'; var d = new Date(s); return isNaN(d) ? '—' : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function toast(msg, kind) { var t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (kind || ''); t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3800); }
  function api(method, path, body) {
    var h = { 'Content-Type': 'application/json' }; if (method !== 'GET') h['X-CSRF-Token'] = csrf;
    return fetch('/api/admin/' + path, { method: method, credentials: 'same-origin', headers: h, body: body === undefined ? undefined : JSON.stringify(body) }).then(function (r) {
      if (r.status === 401) { location.replace('/admin/login'); throw new Error('Session ended'); }
      return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Request failed'); return j; });
    });
  }
  function pill(s) { var c = /^(paid|delivered|approved|active|in)/.test(s) ? 'ok' : /^(cancel|fail|refund|reject|out)/.test(s) ? 'bad' : /^(pending|unpaid|awaiting)/.test(s) ? 'warn' : 'cy'; return '<span class="pill ' + c + '">' + esc(String(s || '—').replace(/_/g, ' ')) + '</span>'; }
  function table(cols, rows, opt) {
    opt = opt || {}; if (!rows.length) return '<div class="mut" style="padding:16px">Nothing to show yet.</div>';
    return '<div class="tw"><table><thead><tr>' + cols.map(function (c) { return '<th' + (c.r ? ' class="r"' : '') + '>' + esc(c.h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r, i) { return '<tr' + (opt.click ? ' class="click" data-row="' + i + '"' : '') + '>' + cols.map(function (c) { return '<td' + (c.r ? ' class="r"' : '') + '>' + c.f(r) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function modal(html) { var m = $('#modal'); m.innerHTML = '<div><button class="x" data-act="close" aria-label="Close">✕</button>' + html + '</div>'; m.hidden = false; }
  function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  function busy(btn, p) { btn.disabled = true; return p.then(function (x) { btn.disabled = false; return x; }, function (e) { btn.disabled = false; toast(e.message, 'bad'); throw e; }); }

  /* ---------- shell ---------- */
  function renderNav() { var path = location.pathname.replace(/\/$/, '') || '/admin'; $('#nav').innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '" class="' + (n[0] === path ? 'on' : '') + '"><span>' + n[2] + '</span>' + n[1] + '</a>'; }).join(''); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="/admin"]'); if (a && !a.target) { e.preventDefault(); history.pushState({}, '', a.getAttribute('href')); $('#side').classList.remove('open'); route(); return; }
    var b = e.target.closest('[data-act]'); if (b && b.dataset.act === 'close') closeModal();
    if (e.target.id === 'modal') closeModal();
  });
  window.addEventListener('popstate', route);
  $('#burger').addEventListener('click', function () { $('#side').classList.toggle('open'); });
  $('#logout').addEventListener('click', function () { api('POST', 'logout', {}).finally(function () { location.replace('/admin/login'); }); });

  var ROUTES = { '/admin': ['Dashboard', pDashboard], '/admin/products': ['Products', pProducts], '/admin/orders': ['Orders', pOrders], '/admin/customers': ['Customers', pCustomers], '/admin/categories': ['Categories', pCategories], '/admin/toys-page': ['Toys Page Editor', pToys], '/admin/payments': ['Payments', pPayments], '/admin/sellers': ['Sellers', pSellers], '/admin/settings': ['Settings & Security', pSettings] };
  function route() {
    var path = location.pathname.replace(/\/$/, '') || '/admin', r = ROUTES[path] || ROUTES['/admin'];
    $('#title').textContent = r[0]; document.title = r[0] + ' | Vimal27 Admin'; renderNav(); view.innerHTML = '<div class="loading">Loading…</div>';
    Promise.resolve().then(function () { return r[1](); }).catch(function (e) { view.innerHTML = '<div class="note">' + esc(e.message) + '</div>'; });
  }

  /* ---------- dashboard ---------- */
  function bars(arr, key, label, cls) { var max = Math.max.apply(null, arr.map(function (x) { return x[key]; }).concat([1])); return '<div class="bar ' + (cls || '') + '">' + arr.map(function (x) { return '<i style="height:' + Math.max(2, Math.round(x[key] / max * 100)) + '%" title="' + esc(x[label] + ': ' + inr(x[key])) + '"></i>'; }).join('') + '</div><div class="axis"><span>' + esc(arr[0][label]) + '</span><span>' + esc(arr[arr.length - 1][label]) + '</span></div>'; }
  function pDashboard() {
    return api('GET', 'dashboard').then(function (d) {
      var delta = d.revenue.lastMonth ? Math.round((d.revenue.thisMonth - d.revenue.lastMonth) / d.revenue.lastMonth * 100) + '% vs last month' : 'No prior-month data';
      view.innerHTML = '<div class="grid cards">' +
        '<div class="card stat gold"><div class="l">Revenue (paid)</div><div class="v">' + inr(d.revenue.total) + '</div><div class="s">This month ' + inr(d.revenue.thisMonth) + ' · ' + esc(delta) + '</div></div>' +
        '<div class="card stat"><div class="l">Total orders</div><div class="v">' + d.orders.total + '</div><div class="s">' + d.orders.delivered + ' delivered · ' + d.orders.inProgress + ' in progress</div></div>' +
        '<div class="card stat"><div class="l">Pending orders</div><div class="v">' + d.orders.pendingPayment + '</div><div class="s">' + d.orders.awaitingVerification + ' payment(s) awaiting verification</div></div>' +
        '<div class="card stat"><div class="l">Customers</div><div class="v">' + (d.customers == null ? '—' : d.customers) + '</div><div class="s">Registered accounts</div></div>' +
        '<div class="card stat"><div class="l">Products</div><div class="v">' + d.products.total + '</div><div class="s">' + d.products.catalogue + ' catalogue · ' + d.products.partner + ' partner</div></div></div>' +
        '<div class="grid two" style="margin-top:16px"><div class="card"><h3>Daily revenue — last 30 days</h3>' + bars(d.daily, 'revenue', 'date') + '</div>' +
        '<div class="card"><h3>Top products <span class="mut" style="font-weight:400">(recent paid orders)</span></h3>' + (d.topProducts.length ? table([{ h: 'Product', f: function (r) { return esc(r.name); } }, { h: 'Qty', r: 1, f: function (r) { return r.qty; } }, { h: 'Revenue', r: 1, f: function (r) { return inr(r.revenue); } }], d.topProducts) : '<div class="mut">No paid orders yet.</div>') + '</div></div>' +
        '<div class="grid eq" style="margin-top:16px"><div class="card"><h3>Monthly revenue — last 12 months</h3>' + bars(d.monthly, 'revenue', 'month', 'm') + '</div>' +
        '<div class="card"><h3>Orders by status</h3>' + (Object.keys(d.orders.byStatus).length ? table([{ h: 'Status', f: function (r) { return pill(r[0]); } }, { h: 'Orders', r: 1, f: function (r) { return r[1]; } }], Object.entries(d.orders.byStatus)) : '<div class="mut">No orders yet.</div>') + '</div></div>' +
        '<div class="card" style="margin-top:16px"><h3>Recent transactions</h3>' + table([{ h: 'Order', f: function (r) { return '<b>' + esc(r.order_no) + '</b>'; } }, { h: 'Customer', f: function (r) { return esc(r.customer_name); } }, { h: 'Method', f: function (r) { return esc(r.payment_method || '—'); } }, { h: 'Payment', f: function (r) { return pill(r.payment_status); } }, { h: 'Date', f: function (r) { return dt(r.created_at); } }, { h: 'Amount', r: 1, f: function (r) { return inr(r.total); } }], d.recent) + '</div>';
    });
  }

  /* ---------- products ---------- */
  function pProducts() {
    return api('GET', 'products').then(function (d) {
      var mode = 'catalogue', q = '';
      function draw() {
        var rows = (mode === 'catalogue' ? d.catalogue : d.partner).filter(function (p) { return !q || (p.name + ' ' + (p.category || '')).toLowerCase().indexOf(q) >= 0; });
        var cols = [{ h: '', f: function (p) { return p.image ? '<img src="' + esc(/^https?:|^\//.test(p.image) ? p.image : '/' + p.image) + '" alt="" width="40" height="40" style="object-fit:cover;border-radius:8px">' : ''; } }, { h: 'Name', f: function (p) { return '<b>' + esc(p.name) + '</b>'; } }, { h: 'Category', f: function (p) { return esc(p.category || '—'); } }, { h: 'Price', r: 1, f: function (p) { return p.price == null ? '—' : inr(p.price); } }];
        if (mode === 'partner') cols.push({ h: 'Shop', f: function (p) { return esc(p.shop); } }, { h: 'Stock', f: function (p) { return p.stock == null ? '—' : esc(p.stock); } }, { h: 'Visible', f: function (p) { return '<label class="sw"><input type="checkbox" data-vis="' + esc(p.id) + '"' + (p.active ? ' checked' : '') + '><s></s></label>'; } });
        else cols.push({ h: 'Type', f: function (p) { return pill(p.type || '—'); } });
        $('#ptable').innerHTML = table(cols, rows.slice(0, 300)) + (rows.length > 300 ? '<div class="mut">Showing first 300 of ' + rows.length + '. Use search.</div>' : '');
      }
      view.innerHTML = '<div class="note">Catalogue products come from <code>js/products-data.js</code> (edited in your codebase). Partner products are in the database and can be shown/hidden here.</div><div class="tools"><select class="f" id="pm" style="width:auto"><option value="catalogue">Catalogue (' + d.catalogue.length + ')</option><option value="partner">Partner products (' + d.partner.length + ')</option></select><input id="pq" placeholder="Search…" class="f" style="width:240px"></div><div class="card" id="ptable"></div>';
      $('#pm').onchange = function () { mode = this.value; draw(); }; $('#pq').oninput = function () { q = this.value.toLowerCase(); draw(); };
      view.addEventListener('change', function h(e) { if (!document.body.contains($('#ptable'))) { view.removeEventListener('change', h); return; } var id = e.target.dataset && e.target.dataset.vis; if (!id) return; api('POST', 'products/visibility', { id: id, active: e.target.checked }).then(function () { toast('Updated', 'ok'); }).catch(function (x) { toast(x.message, 'bad'); e.target.checked = !e.target.checked; }); });
      draw();
    });
  }

  /* ---------- orders ---------- */
  function orderActions(o, items, events) {
    var S = ['pending_payment', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refund_pending', 'refunded'], P = ['unpaid', 'pending', 'paid', 'failed', 'refund_pending', 'refunded'];
    modal('<h2>' + esc(o.order_no) + ' ' + pill(o.order_status) + ' ' + pill(o.payment_status) + '</h2><p class="mut">' + esc(o.customer_name) + ' · ' + esc(o.phone || '') + ' · ' + esc(o.email || '') + '<br>' + esc([o.address_line1, o.address_line2, o.city, o.state, o.pincode].filter(Boolean).join(', ')) + '</p>' +
      table([{ h: 'Item', f: function (i) { return esc(i.name); } }, { h: 'Qty', r: 1, f: function (i) { return i.qty; } }, { h: 'Total', r: 1, f: function (i) { return inr(i.line_total); } }], items) + '<p class="r"><b>Order total: ' + inr(o.total) + '</b> · ' + esc(o.payment_method || '') + (o.payment_reference ? ' · Ref ' + esc(o.payment_reference) : '') + '</p>' +
      '<div class="row2" style="margin-top:10px"><div class="card"><h3>Order status</h3><select class="f" id="os">' + S.map(function (s) { return '<option' + (s === o.order_status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select><input class="f" id="on" placeholder="Note (optional)" style="margin-top:8px"><button class="btn sm" id="osb" style="margin-top:8px">Update status</button></div>' +
      '<div class="card"><h3>Payment</h3><select class="f" id="ps">' + P.map(function (s) { return '<option' + (s === o.payment_status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select><input class="f" id="pr" placeholder="UTR / reference" value="' + esc(o.payment_reference || '') + '" style="margin-top:8px"><button class="btn gold sm" id="psb" style="margin-top:8px">Update payment</button></div></div>' +
      '<div class="card" style="margin-top:12px"><h3>Tracking</h3><div class="row3"><input class="f" id="tc" placeholder="Carrier"><input class="f" id="tn" placeholder="Tracking no."><input class="f" id="te" type="date"></div><input class="f" id="tu" placeholder="Tracking URL (https://…)" style="margin-top:8px"><button class="btn sm" id="tsb" style="margin-top:8px">Save tracking</button></div>' +
      '<h3 style="margin:16px 0 8px">History</h3><div class="tl">' + (events.length ? events.map(function (e) { return '<div><b>' + esc(e.status || e.event || '') + '</b> <span class="mut">' + dt(e.created_at) + '</span><br>' + esc(e.note || '') + '</div>'; }).join('') : '<span class="mut">No events.</span>') + '</div>');
    var go = function (btn, path, body) { busy(btn, api('POST', 'orders/' + path, Object.assign({ id: o.id }, body))).then(function () { toast('Saved', 'ok'); closeModal(); pOrders(); }); };
    $('#osb').onclick = function () { go(this, 'status', { status: $('#os').value, note: $('#on').value }); };
    $('#psb').onclick = function () { go(this, 'payment', { status: $('#ps').value, reference: $('#pr').value, note: $('#on').value }); };
    $('#tsb').onclick = function () { go(this, 'tracking', { carrier: $('#tc').value, number: $('#tn').value, url: $('#tu').value, eta: $('#te').value }); };
  }
  function openOrder(id) { api('GET', 'orders/' + id).then(function (d) { orderActions(d.order, d.items, d.events); }).catch(function (e) { toast(e.message, 'bad'); }); }
  function pOrders() {
    var st = '', q = '';
    function load() { return api('GET', 'orders?status=' + encodeURIComponent(st) + '&q=' + encodeURIComponent(q)).then(function (d) {
      $('#otable').innerHTML = table([{ h: 'Order', f: function (o) { return '<b>' + esc(o.order_no) + '</b>'; } }, { h: 'Customer', f: function (o) { return esc(o.customer_name); } }, { h: 'Status', f: function (o) { return pill(o.order_status); } }, { h: 'Payment', f: function (o) { return pill(o.payment_status); } }, { h: 'Date', f: function (o) { return dt(o.created_at); } }, { h: 'Total', r: 1, f: function (o) { return inr(o.total); } }], d.orders, { click: 1 });
      $('#otable').onclick = function (e) { var tr = e.target.closest('tr[data-row]'); if (tr) openOrder(d.orders[+tr.dataset.row].id); };
      if (!$('#sf').options.length) $('#sf').innerHTML = '<option value="">All statuses</option>' + d.statuses.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    }); }
    view.innerHTML = '<div class="tools"><select class="f" id="sf" style="width:auto"></select><input id="oq" class="f" placeholder="Search order no, name, phone, UTR…" style="width:300px"></div><div class="card" id="otable"><div class="loading">Loading…</div></div>';
    $('#sf').onchange = function () { st = this.value; load(); }; var tm; $('#oq').oninput = function () { q = this.value; clearTimeout(tm); tm = setTimeout(load, 300); };
    return load();
  }

  /* ---------- customers / categories / payments / sellers ---------- */
  function pCustomers() { return api('GET', 'customers').then(function (d) { var all = d.customers;
    view.innerHTML = '<div class="tools"><input id="cq" class="f" placeholder="Search name or email…" style="width:280px"><span class="mut">' + all.length + ' customers</span></div><div class="card" id="ct"></div>';
    function draw(q) { $('#ct').innerHTML = table([{ h: 'Name', f: function (c) { return esc(c.name || '—'); } }, { h: 'Email', f: function (c) { return esc(c.email); } }, { h: 'Phone', f: function (c) { return esc(c.phone || '—'); } }, { h: 'Joined', f: function (c) { return dt(c.created_at); } }, { h: 'Last sign-in', f: function (c) { return dt(c.last_sign_in_at); } }, { h: 'Orders', r: 1, f: function (c) { return c.orders; } }, { h: 'Spent', r: 1, f: function (c) { return inr(c.spent); } }], all.filter(function (c) { return !q || (c.name + c.email).toLowerCase().indexOf(q) >= 0; })); }
    $('#cq').oninput = function () { draw(this.value.toLowerCase()); }; draw(''); }); }
  function pCategories() { return api('GET', 'categories').then(function (d) {
    var t = function (rows) { return table([{ h: 'Category', f: function (r) { return esc(r.category); } }, { h: 'Products', r: 1, f: function (r) { return r.count; } }], rows); };
    view.innerHTML = '<div class="grid eq"><div class="card"><h3>Catalogue categories</h3>' + t(d.catalogue) + '</div><div class="card"><h3>Partner product categories</h3>' + t(d.partner) + '</div></div>' +
      '<div class="card" style="margin-top:16px"><h3>Toys page category cards (live)</h3>' + table([{ h: 'Name', f: function (r) { return esc(r.name); } }, { h: 'Links to', f: function (r) { return esc(r.href); } }, { h: 'Shown', f: function (r) { return r.enabled ? pill('active') : pill('hidden'); } }], d.toysPageCategories) + '<p><a class="btn" href="/admin/toys-page">Edit in Toys Page Editor</a></p></div>'; }); }
  function pPayments() { return api('GET', 'payments').then(function (d) {
    view.innerHTML = '<div class="grid cards">' + Object.keys(d.sums).map(function (k) { return '<div class="card stat' + (k === 'paid' ? ' gold' : '') + '"><div class="l">' + esc(k.replace(/_/g, ' ')) + '</div><div class="v">' + inr(d.sums[k]) + '</div></div>'; }).join('') + '</div>' +
      '<div class="card" style="margin-top:16px"><h3>Order payments <span class="mut" style="font-weight:400">(click to verify / update)</span></h3><div id="pt"></div></div>' +
      '<div class="card" style="margin-top:16px"><h3>Seller subscription payments</h3>' + table([{ h: 'Shop', f: function (p) { return esc(p.shop); } }, { h: 'Amount', r: 1, f: function (p) { return inr(p.amount); } }, { h: 'Status', f: function (p) { return pill(p.status || '—'); } }, { h: 'Date', f: function (p) { return dt(p.paid_at || p.created_at); } }], d.sellerSubscriptions) + '</div>';
    $('#pt').innerHTML = table([{ h: 'Order', f: function (o) { return '<b>' + esc(o.order_no) + '</b>'; } }, { h: 'Customer', f: function (o) { return esc(o.customer_name); } }, { h: 'Method', f: function (o) { return esc(o.payment_method || '—'); } }, { h: 'Reference', f: function (o) { return esc(o.payment_reference || '—'); } }, { h: 'Status', f: function (o) { return pill(o.payment_status); } }, { h: 'Amount', r: 1, f: function (o) { return inr(o.total); } }], d.orders, { click: 1 });
    $('#pt').onclick = function (e) { var tr = e.target.closest('tr[data-row]'); if (tr) openOrder(d.orders[+tr.dataset.row].id); }; }); }
  function pSellers() { return api('GET', 'sellers').then(function (d) {
    view.innerHTML = '<div class="card"><h3>Seller applications</h3><div id="sa"></div></div><div class="card" style="margin-top:16px"><h3>Seller accounts</h3>' + table([{ h: 'Shop', f: function (p) { return '<b>' + esc(p.shop_name || '—') + '</b>'; } }, { h: 'Owner', f: function (p) { return esc(p.owner_name || p.full_name || '—'); } }, { h: 'Phone', f: function (p) { return esc(p.phone || '—'); } }, { h: 'Subscription', f: function (p) { return pill(p.subscription_status || '—'); } }, { h: 'Joined', f: function (p) { return dt(p.created_at); } }], d.profiles) + '</div>';
    $('#sa').innerHTML = table([{ h: 'Applicant', f: function (a) { return '<b>' + esc(a.shop_name || a.business_name || a.name || a.id.slice(0, 8)) + '</b>'; } }, { h: 'Phone', f: function (a) { return esc(a.phone || '—'); } }, { h: 'Status', f: function (a) { return pill(a.status || '—'); } }, { h: 'Date', f: function (a) { return dt(a.created_at); } }, { h: 'Action', f: function (a) { return '<button class="btn sm" data-ap="' + esc(a.id) + '" data-s="approved">Approve</button> <button class="btn sm red" data-ap="' + esc(a.id) + '" data-s="rejected">Reject</button>'; } }], d.applications);
    $('#sa').onclick = function (e) { var b = e.target.closest('[data-ap]'); if (!b || !confirm(b.dataset.s + ' this application?')) return; busy(b, api('POST', 'sellers/application-status', { id: b.dataset.ap, status: b.dataset.s })).then(function () { toast('Updated', 'ok'); pSellers(); }); }; }); }

  /* ---------- settings ---------- */
  function pSettings() { return api('GET', 'settings').then(function (d) {
    view.innerHTML = '<div class="grid eq"><div class="card"><h3>Owner account</h3><p><b>' + esc(d.account.username) + '</b><br>' + esc(d.account.email) + '<br><span class="mut">Password changed ' + dt(d.account.password_changed_at) + '</span></p>' +
      '<h3 style="margin-top:18px">Change password</h3><div class="fld"><label>Current password</label><input class="f" type="password" id="cp" autocomplete="current-password"></div><div class="fld"><label>New password (min 12 characters)</label><input class="f" type="password" id="np" autocomplete="new-password"></div><div class="fld"><label>Repeat new password</label><input class="f" type="password" id="np2" autocomplete="new-password"></div><button class="btn" id="pwb">Update password</button> <span class="mut">Signs out all other devices.</span></div>' +
      '<div class="card"><h3>Active sessions</h3>' + table([{ h: 'Signed in', f: function (s) { return dt(s.created_at) + (s.current ? ' ' + pill('this device') : ''); } }, { h: 'IP', f: function (s) { return esc(s.ip || ''); } }, { h: 'Last active', f: function (s) { return dt(s.last_seen_at); } }], d.sessions) + '<p><button class="btn red sm" id="rv">Sign out all other sessions</button></p><p class="mut">Sessions end after 2h idle or 12h total.</p></div></div>' +
      '<div class="grid eq" style="margin-top:16px"><div class="card"><h3>Login activity</h3>' + table([{ h: 'When', f: function (a) { return dt(a.at); } }, { h: 'IP', f: function (a) { return esc(a.ip); } }, { h: 'Result', f: function (a) { return a.success ? pill('ok') : pill('failed'); } }], d.attempts) + '</div><div class="card"><h3>Audit log</h3>' + table([{ h: 'When', f: function (a) { return dt(a.at); } }, { h: 'Action', f: function (a) { return esc(a.action); } }, { h: 'IP', f: function (a) { return esc(a.ip || ''); } }], d.audit) + '</div></div>';
    $('#pwb').onclick = function () { if ($('#np').value !== $('#np2').value) return toast('New passwords do not match', 'bad'); busy(this, api('POST', 'settings/password', { currentPassword: $('#cp').value, newPassword: $('#np').value })).then(function () { toast('Password updated', 'ok'); pSettings(); }); };
    $('#rv').onclick = function () { busy(this, api('POST', 'settings/revoke-others', {})).then(function (r) { toast(r.revoked + ' session(s) signed out', 'ok'); pSettings(); }); }; }); }

  /* ---------- Toys page editor ---------- */
  var T = { draft: null, pub: null, defaults: null, products: [] };
  var SEC_NAMES = { hero: 'Hero banner', categories: 'Shop by category', collections: 'Featured collections', popular: 'Popular picks (products)', promo: 'Promotional banner', arrivals: 'New arrivals', why: 'Why choose Vimal27', life: 'Lifestyle / playtime', directory: 'All collections directory', final: 'Final call to action' };
  function getp(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setp(o, p, v) { var ks = p.split('.'), l = ks.pop(), t = ks.reduce(function (a, k) { return a[k]; }, o); t[l] = v; }
  function tf(label, path, type) { var v = getp(T.draft, path); if (type === 'area') return '<div class="fld"><label>' + label + '</label><textarea class="f" data-p="' + path + '">' + esc(v) + '</textarea></div>'; return '<div class="fld"><label>' + label + '</label><input class="f" data-p="' + path + '" value="' + esc(v) + '"' + (type === 'color' ? ' type="color" style="height:40px;padding:3px"' : '') + '></div>'; }
  function imgf(label, path) { var v = getp(T.draft, path); return '<div class="fld"><label>' + label + '</label><div class="imgf"><img src="' + esc(v ? (/^https?:|^\//.test(v) ? v : '/' + v) : '') + '" alt=""><input class="f" data-p="' + path + '" placeholder="Image URL or upload →" value="' + esc(v) + '"><label class="btn ghost sm" style="margin:0;white-space:nowrap">Upload<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-up="' + path + '" hidden></label></div></div>'; }
  function sw(path, text) { return '<label class="sw" title="' + (text || 'Enabled') + '"><input type="checkbox" data-c="' + path + '"' + (getp(T.draft, path) ? ' checked' : '') + '><s></s></label>'; }
  function secBody(id) {
    var b = 'sections.' + id, s = T.draft.sections[id];
    if (id === 'hero') return tf('Eyebrow', b + '.eyebrow') + '<div class="row2">' + tf('Heading (line 1)', b + '.headingA') + tf('Heading (line 2, highlighted)', b + '.headingB') + '</div>' + tf('Description', b + '.text', 'area') + '<div class="row2">' + tf('Button 1 label', b + '.cta1.label') + tf('Button 1 link', b + '.cta1.href') + tf('Button 2 label', b + '.cta2.label') + tf('Button 2 link', b + '.cta2.href') + '</div>' + imgf('Hero image', b + '.image') + tf('Image description (accessibility)', b + '.imageAlt') + '<div class="row3">' + [0, 1, 2].map(function (i) { return tf('Label ' + (i + 1), b + '.labels.' + i); }).join('') + '</div>';
    if (id === 'categories') return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + tf('Subtitle', b + '.subtitle') + s.items.map(function (c, i) { var p = b + '.items.' + i; return '<div class="mini"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">' + sw(p + '.enabled') + '<b style="flex:1">' + esc(c.name) + '</b><button class="btn ghost sm" data-mv="' + b + '.items|' + i + '|-1">↑</button><button class="btn ghost sm" data-mv="' + b + '.items|' + i + '|1">↓</button><button class="btn ghost sm" data-del="' + b + '.items|' + i + '">Remove</button></div><div class="row2">' + tf('Name', p + '.name') + tf('Link (existing page)', p + '.href') + '</div><div class="row2">' + imgf('Image', p + '.image') + tf('Background colour', p + '.bg', 'color') + '</div></div>'; }).join('') + '<button class="btn ghost sm" data-add="' + b + '.items">+ Add category</button>';
    if (id === 'collections') return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + s.items.map(function (c, i) { var p = b + '.items.' + i; return '<div class="mini"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">' + sw(p + '.enabled') + '<b style="flex:1">' + esc(c.title) + '</b><button class="btn ghost sm" data-mv="' + b + '.items|' + i + '|-1">↑</button><button class="btn ghost sm" data-mv="' + b + '.items|' + i + '|1">↓</button></div><div class="row2">' + tf('Title', p + '.title') + tf('Link', p + '.href') + '</div>' + tf('Description', p + '.desc') + imgf('Background photo (blank = default)', p + '.image') + '</div>'; }).join('');
    if (id === 'popular') { var sel = s.featured; return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + tf('Subtitle', b + '.subtitle') + '<div class="row2"><div class="fld"><label>Product selection</label><select class="f" data-p="' + b + '.mode"><option value="auto"' + (s.mode === 'auto' ? ' selected' : '') + '>Automatic (available toys, newest first)</option><option value="manual"' + (s.mode === 'manual' ? ' selected' : '') + '>Manual — only the products I tick</option></select></div>' + tf('Max products (2–12)', b + '.limit') + '</div><div class="fld"><label>Featured products (' + sel.length + ' selected) — used in Manual mode</label><input class="f" id="pfq" placeholder="Search products…" style="margin-bottom:8px"><div class="pick" id="pick">' + T.products.map(function (p) { return '<label data-n="' + esc((p.name + ' ' + (p.category || '')).toLowerCase()) + '"><input type="checkbox" data-feat="' + esc(p.key) + '"' + (sel.indexOf(p.key) >= 0 ? ' checked' : '') + '> ' + esc(p.name) + ' <span class="mut">· ' + esc(p.category || '') + ' · ' + esc(p.source) + '</span></label>'; }).join('') + '</div></div>'; }
    if (id === 'promo') return tf('Eyebrow', b + '.eyebrow') + '<div class="row2">' + tf('Heading (normal)', b + '.headingA') + tf('Heading (gold)', b + '.headingB') + '</div>' + tf('Description', b + '.text', 'area') + '<div class="row2">' + tf('Button label', b + '.cta.label') + tf('Button link', b + '.cta.href') + '</div>' + imgf('Banner image', b + '.image');
    if (id === 'why') return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + s.items.map(function (c, i) { var p = b + '.items.' + i; return '<div class="mini"><div class="row2">' + tf('Title', p + '.title') + tf('Icon (Font Awesome name, e.g. fa-medal)', p + '.icon') + '</div>' + tf('Text', p + '.text') + '</div>'; }).join('');
    if (id === 'life') return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + '<div class="note">Tiles appear only when a photo is set.</div>' + s.items.map(function (c, i) { var p = b + '.items.' + i; return '<div class="mini">' + tf('Caption', p + '.label') + imgf('Photo', p + '.image') + '</div>'; }).join('');
    if (id === 'arrivals') return tf('Eyebrow', b + '.eyebrow') + tf('Heading', b + '.heading') + '<div class="note">Shows only products that have a real creation date.</div>';
    if (id === 'directory') return tf('Heading', b + '.heading') + tf('Subtitle', b + '.subtitle');
    if (id === 'final') return tf('Heading', b + '.heading') + tf('Text', b + '.text', 'area') + '<div class="row2">' + tf('Button label', b + '.cta.label') + tf('Button link', b + '.cta.href') + '</div>';
    return '';
  }
  var openSecs = {}, dirty = false;
  function drawToys() {
    var d = T.draft;
    view.innerHTML = '<div class="note">Edit the draft below, <b>Preview</b> it on the real Toys page, then <b>Publish</b>. Published changes go live in about 30 seconds — no redeploy needed.' + (T.hasUnpublished ? ' <b>You have unpublished changes.</b>' : '') + '</div>' +
      d.order.map(function (id, i) { var s = d.sections[id]; return '<div class="sec' + (s.enabled ? '' : ' off') + '" data-sec="' + id + '"><div class="hd" data-tog="' + id + '">' + sw('sections.' + id + '.enabled', 'Show this section') + '<b>' + esc(SEC_NAMES[id]) + '</b>' + (s.enabled ? '' : '<span class="pill">hidden</span>') + '<button class="btn ghost sm" data-mvs="' + i + '|-1" ' + (i === 0 ? 'disabled' : '') + ' aria-label="Move up">↑</button><button class="btn ghost sm" data-mvs="' + i + '|1" ' + (i === d.order.length - 1 ? 'disabled' : '') + ' aria-label="Move down">↓</button><span>' + (openSecs[id] ? '▾' : '▸') + '</span></div>' + (openSecs[id] ? '<div class="bd">' + secBody(id) + '</div>' : '') + '</div>'; }).join('') +
      '<div class="sticky"><button class="btn ghost" id="tsave">Save draft</button><button class="btn ghost" id="tprev">Preview ↗</button><button class="btn gold" id="tpub">Publish to live site</button><span style="flex:1"></span><button class="btn ghost sm" id="tdisc">Discard changes</button><button class="btn ghost sm" id="treset">Reset to defaults</button></div>';
  }
  function saveDraft() { return api('PUT', 'toys-page', { content: T.draft }).then(function (r) { T.draft = r.content; dirty = false; return r; }); }
  function pToys() {
    return Promise.all([api('GET', 'toys-page'), api('GET', 'products')]).then(function (r) {
      var d = r[0]; T.draft = d.draft; T.pub = d.published; T.defaults = d.defaults; T.hasUnpublished = d.hasUnpublished;
      T.products = r[1].catalogue.filter(function (p) { return p.category === 'Toys'; }).concat(r[1].partner);
      openSecs = {}; dirty = false; drawToys(); bindToys();
    });
  }
  var toysBound = false;
  function bindToys() {
    if (toysBound) return; toysBound = true;
    view.addEventListener('input', function (e) {
      var p = e.target.dataset && e.target.dataset.p; if (p && T.draft) { var v = e.target.value; if (p.slice(-6) === '.limit') v = parseInt(v, 10) || 8; setp(T.draft, p, v); dirty = true; }
      if (e.target.id === 'pfq') { var q = e.target.value.toLowerCase(); view.querySelectorAll('#pick label').forEach(function (l) { l.style.display = l.dataset.n.indexOf(q) >= 0 ? '' : 'none'; }); }
    });
    view.addEventListener('change', function (e) {
      if (!T.draft || !$('#tsave')) return; var t = e.target, ds = t.dataset || {};
      if (ds.c) { setp(T.draft, ds.c, t.checked); dirty = true; drawToys(); }
      if (ds.p && t.tagName === 'SELECT') { setp(T.draft, ds.p, t.value); dirty = true; }
      if (ds.feat) { var f = T.draft.sections.popular.featured, i = f.indexOf(ds.feat); if (t.checked && i < 0) f.push(ds.feat); if (!t.checked && i >= 0) f.splice(i, 1); dirty = true; }
      if (ds.up && t.files[0]) { var file = t.files[0]; if (file.size > 3 * 1024 * 1024) return toast('Image must be under 3 MB', 'bad'); var rd = new FileReader(); rd.onload = function () { toast('Uploading…'); api('POST', 'upload', { data: String(rd.result).split(',')[1] }).then(function (r) { setp(T.draft, ds.up, r.url); dirty = true; toast('Uploaded', 'ok'); drawToys(); }).catch(function (x) { toast(x.message, 'bad'); }); }; rd.readAsDataURL(file); }
    });
    view.addEventListener('click', function (e) {
      if (!T.draft || !$('#tsave')) return; var t = e.target, b;
      if ((b = t.closest('[data-mvs]'))) { var a = b.dataset.mvs.split('|'), i = +a[0], j = i + +a[1], o = T.draft.order; var x = o[i]; o[i] = o[j]; o[j] = x; dirty = true; drawToys(); return; }
      if ((b = t.closest('[data-mv]'))) { var q = b.dataset.mv.split('|'), arr = getp(T.draft, q[0]), k = +q[1], m = k + +q[2]; if (m >= 0 && m < arr.length) { var y = arr[k]; arr[k] = arr[m]; arr[m] = y; dirty = true; drawToys(); } return; }
      if ((b = t.closest('[data-del]'))) { var dq = b.dataset.del.split('|'); getp(T.draft, dq[0]).splice(+dq[1], 1); dirty = true; drawToys(); return; }
      if ((b = t.closest('[data-add]'))) { getp(T.draft, b.dataset.add).push({ name: 'New category', href: 'toys.html', image: '', bg: '#EAF8FF', enabled: true }); dirty = true; drawToys(); return; }
      if (t.closest('.sw') || t.closest('button')) { /* handled below */ } else if ((b = t.closest('[data-tog]'))) { openSecs[b.dataset.tog] = !openSecs[b.dataset.tog]; drawToys(); return; }
      if (t.id === 'tsave') busy(t, saveDraft()).then(function () { toast('Draft saved', 'ok'); });
      if (t.id === 'tprev') busy(t, saveDraft()).then(function () { window.open('/toys.html?preview=1', '_blank', 'noopener'); });
      if (t.id === 'tpub') { if (!confirm('Publish these changes to the live Toys page?')) return; busy(t, saveDraft().then(function () { return api('POST', 'toys-page/publish', {}); })).then(function (r) { toast('Published (v' + r.version + '). Live within ~30 seconds.', 'ok'); pToys(); }); }
      if (t.id === 'tdisc') { if (!confirm('Discard your unpublished edits?')) return; busy(t, api('POST', 'toys-page/discard', {})).then(function () { toast('Draft reset to published', 'ok'); pToys(); }); }
      if (t.id === 'treset') { if (!confirm('Reset the DRAFT to the original default design? (Live page unchanged until you publish.)')) return; busy(t, api('POST', 'toys-page/reset', {})).then(function () { toast('Draft reset to defaults', 'ok'); pToys(); }); }
    });
    window.addEventListener('beforeunload', function (e) { if (dirty && $('#tsave')) { e.preventDefault(); e.returnValue = ''; } });
  }

  /* ---------- boot ---------- */
  api('GET', 'me').then(function (m) { csrf = m.csrf; $('#me').textContent = m.username || ''; route(); }).catch(function () { location.replace('/admin/login'); });
})();
