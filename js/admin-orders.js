/* Admin order management. Access is checked against user_roles, and every change goes through
   database functions that re-check admin rights and the allowed status moves. */
(function () {
  'use strict';
  var V = VPO, sb = supabaseClient, el = document.getElementById('voApp');
  var S = { orders: [], items: {}, events: {}, requests: {}, reqAll: [], services: [], tab: 'orders', sel: null, f: { q: '', status: '', pay: '', type: '' }, rq: 'open' };
  var KIND = { cancellation: 'Cancellation request', damaged: 'Damaged item', missing: 'Missing item', incorrect: 'Incorrect item', support: 'Support message' };
  var SERVICES = { setup: 'Aquarium setup', custom: 'Custom aquarium', maintenance: 'Maintenance', cleaning: 'Cleaning', other: 'Other' };
  var PAYS = ['unpaid', 'pending', 'paid', 'failed', 'refund_pending', 'refunded'];
  function group(rows, key) { var m = {}; (rows || []).forEach(function (r) { (m[r[key]] = m[r[key]] || []).push(r); }); return m; }
  function orderOf(id) { return S.orders.filter(function (o) { return o.id === id; })[0]; }

  async function load(keep) {
    var r = await Promise.all([
      sb.from('vp_orders').select('*').order('created_at', { ascending: false }),
      sb.from('vp_order_items').select('*'),
      sb.from('vp_order_events').select('*').order('created_at', { ascending: true }),
      sb.from('vp_order_requests').select('*').order('created_at', { ascending: false }),
      sb.from('vp_service_requests').select('*').order('created_at', { ascending: false })
    ]);
    var err = r.map(function (x) { return x.error; }).filter(Boolean)[0];
    if (err) { el.innerHTML = '<div class="vo-alert bad">' + V.esc(V.msg(err)) + '<br>Run supabase-orders.sql in the Supabase SQL Editor first.</div>'; return; }
    S.orders = r[0].data || []; S.items = group(r[1].data, 'order_id'); S.events = group(r[2].data, 'order_id');
    S.reqAll = r[3].data || []; S.requests = group(S.reqAll, 'order_id'); S.services = r[4].data || [];
    render(); if (keep && S.sel) openDrawer(S.sel);
    else if (!keep && location.hash.length > 1) { var hn = decodeURIComponent(location.hash.slice(1)); var ho = S.orders.filter(function (x) { return x.order_no === hn; })[0]; if (ho) openDrawer(ho.id); }
  }

  function filtered() {
    var f = S.f, q = f.q.trim().toLowerCase();
    return S.orders.filter(function (o) {
      if (f.status && o.order_status !== f.status) return false;
      if (f.pay && o.payment_status !== f.pay) return false;
      if (f.type && o.fulfilment !== f.type) return false;
      if (q && (o.order_no + ' ' + o.customer_name + ' ' + o.phone + ' ' + (o.email || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function count(fn) { return S.orders.filter(fn).length; }

  function render() {
    var openReq = S.reqAll.filter(function (r) { return r.status === 'open' || r.status === 'in_review'; }).length;
    var h = '<div class="vo-stats">' +
      stat('Payments to verify', count(function (o) { return o.payment_status === 'pending' && o.order_status === 'pending_payment'; })) +
      stat('Awaiting payment ID', count(function (o) { return o.payment_status === 'unpaid' && o.order_status === 'pending_payment'; })) +
      stat('To prepare', count(function (o) { return o.order_status === 'confirmed' || o.order_status === 'processing'; })) +
      stat('On the way', count(function (o) { return o.order_status === 'shipped' || o.order_status === 'out_for_delivery'; })) +
      stat('Open requests', openReq) +
      stat('Refunds to complete', count(function (o) { return o.order_status === 'refund_pending' || o.payment_status === 'refund_pending'; })) + '</div>';
    h += '<div class="vo-tabs"><button class="vo-tab' + (S.tab === 'orders' ? ' on' : '') + '" data-act="tab" data-tab="orders">Orders (' + S.orders.length + ')</button><button class="vo-tab' + (S.tab === 'requests' ? ' on' : '') + '" data-act="tab" data-tab="requests">Requests (' + openReq + ' open)</button><button class="vo-tab' + (S.tab === 'services' ? ' on' : '') + '" data-act="tab" data-tab="services">Service requests (' + S.services.filter(function (s) { return s.status === 'requested'; }).length + ' new)</button></div>';
    h += S.tab === 'orders' ? ordersView() : S.tab === 'requests' ? requestsView() : servicesView();
    el.innerHTML = h;
  }
  function stat(l, n) { return '<div class="vo-stat"><b>' + n + '</b><span>' + l + '</span></div>'; }

  function ordersView() {
    var rows = filtered(), f = S.f;
    var sOpts = '<option value="">All</option>' + Object.keys(V.STATUS).map(function (k) { return '<option value="' + k + '"' + (f.status === k ? ' selected' : '') + '>' + V.STATUS[k].label + '</option>'; }).join('');
    var pOpts = '<option value="">All</option>' + PAYS.map(function (k) { return '<option value="' + k + '"' + (f.pay === k ? ' selected' : '') + '>' + k.replace('_', ' ') + '</option>'; }).join('');
    var h = '<div class="vo-filters"><div class="wide"><label for="fq">Search</label><input id="fq" data-f="q" value="' + V.esc(f.q) + '" placeholder="Order no, name, phone or email"></div>' +
      '<div><label for="fs">Order status</label><select id="fs" data-f="status">' + sOpts + '</select></div>' +
      '<div><label for="fp">Payment</label><select id="fp" data-f="pay">' + pOpts + '</select></div>' +
      '<div><label for="ft">Type</label><select id="ft" data-f="type"><option value="">All</option><option value="shipping"' + (f.type === 'shipping' ? ' selected' : '') + '>Standard shipping</option><option value="live_arrangement"' + (f.type === 'live_arrangement' ? ' selected' : '') + '>Live pets / fish</option></select></div>' +
      '<div><button class="vo-btn alt" data-act="clear">Clear</button></div><div><button class="vo-btn alt" data-act="csv">Export CSV</button></div></div>';
    h += '<p class="vo-note" role="status" style="margin:0 0 10px">Showing ' + rows.length + ' of ' + S.orders.length + ' orders</p>';
    if (!rows.length) return h + '<div class="vo-empty">No orders match.</div>';
    return h + '<div class="vo-card"><div class="vo-table-wrap"><table class="vo-table"><thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th class="r">Total</th><th>Order status</th><th>Payment</th><th>Type</th></tr></thead><tbody>' +
      rows.map(function (o) { return '<tr class="vo-row" tabindex="0" data-act="open" data-id="' + o.id + '"><td><b>' + V.esc(o.order_no) + '</b></td><td>' + V.esc(o.customer_name) + '<br><small>' + V.esc(o.phone) + '</small></td><td>' + V.esc(V.date(o.created_at)) + '</td><td class="r">' + V.money(o.total) + '</td><td>' + V.statusBadge(o) + '</td><td>' + V.payBadge(o) + '</td><td>' + (o.fulfilment === 'live_arrangement' ? V.badge('Live', 'blue') : V.badge('Parcel', 'grey')) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }

  function requestsView() {
    var sel = '<div class="vo-tabs">' + [['open', 'Open'], ['all', 'All'], ['resolved', 'Resolved']].map(function (x) { return '<button class="vo-tab' + (S.rq === x[0] ? ' on' : '') + '" data-act="rq" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var rows = S.reqAll.filter(function (r) { return S.rq === 'all' || (S.rq === 'open' ? (r.status === 'open' || r.status === 'in_review') : (r.status === 'resolved' || r.status === 'rejected')); });
    if (!rows.length) return sel + '<div class="vo-empty">Nothing here.</div>';
    return sel + rows.map(function (r) {
      var o = orderOf(r.order_id) || {};
      var live = r.status === 'open' || r.status === 'in_review';
      return '<div class="vo-card"><div class="vo-card-top" style="cursor:default"><span><span class="vo-no">' + V.esc(KIND[r.kind] || r.kind) + ' · ' + V.esc(o.order_no || '') + '</span><span class="vo-meta"><span>' + V.esc(o.customer_name || '') + '</span><span>' + V.esc(o.phone || '') + '</span><span>' + V.esc(V.date(r.created_at, true)) + '</span></span></span>' + V.badge(r.status.replace('_', ' '), live ? 'amber' : r.status === 'resolved' ? 'green' : 'red') + '</div><div class="vo-body" style="display:block"><p>' + V.esc(r.message) + '</p>' +
        (live ? '<label>Reply or note (the customer can see this)</label><input data-note="' + r.id + '" maxlength="300"><div class="vo-actions">' +
          (r.kind === 'cancellation' ? '<button class="vo-btn good" data-act="approve-cancel" data-id="' + r.id + '" data-order="' + r.order_id + '">Approve and cancel order</button>' : '<button class="vo-btn good" data-act="req" data-s="resolved" data-id="' + r.id + '">Mark resolved</button>') +
          '<button class="vo-btn alt" data-act="req" data-s="in_review" data-id="' + r.id + '">In review</button><button class="vo-btn warn" data-act="req" data-s="rejected" data-id="' + r.id + '">Decline</button><button class="vo-btn alt" data-act="open" data-id="' + r.order_id + '">View order</button></div>'
          : (r.admin_note ? '<p class="vo-note">Reply: ' + V.esc(r.admin_note) + '</p>' : '')) + '</div></div>';
    }).join('');
  }

  function servicesView() {
    if (!S.services.length) return '<div class="vo-empty">No service requests yet.</div>';
    return S.services.map(function (s) {
      return '<div class="vo-card"><div class="vo-card-top" style="cursor:default"><span><span class="vo-no">' + V.esc(SERVICES[s.service] || s.service) + ' · ' + V.esc(s.name) + '</span><span class="vo-meta"><span>' + V.esc(s.phone) + '</span><span>Requested ' + V.esc(V.date(s.created_at)) + '</span>' + (s.preferred_date ? '<span>Preferred ' + V.esc(V.date(s.preferred_date)) + '</span>' : '') + '</span></span>' + V.badge(s.status, s.status === 'completed' ? 'green' : s.status === 'cancelled' ? 'red' : s.status === 'requested' ? 'amber' : 'blue') + '</div><div class="vo-body" style="display:block">' +
        (s.address ? '<p class="vo-note">' + V.esc(s.address) + '</p>' : '') + (s.details ? '<p>' + V.esc(s.details) + '</p>' : '') +
        '<div class="vo-two"><div><label>Status</label><select data-svc-status="' + s.id + '">' + ['requested', 'confirmed', 'scheduled', 'completed', 'cancelled'].map(function (k) { return '<option' + (s.status === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></div><div><label>Appointment (needed for Scheduled)</label><input type="datetime-local" data-svc-when="' + s.id + '" value="' + (s.scheduled_for ? new Date(new Date(s.scheduled_for) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '') + '"></div></div>' +
        '<label>Note for the customer</label><input data-svc-note="' + s.id + '" maxlength="300" value="' + V.esc(s.admin_note || '') + '"><div class="vo-actions"><button class="vo-btn" data-act="svc-save" data-id="' + s.id + '">Save</button><a class="vo-btn alt" target="_blank" rel="noopener" href="' + V.esc(V.waLink('Hi ' + s.name + ', this is Vimal Pets & Toys about your ' + (SERVICES[s.service] || 'service') + ' request.')) + '">WhatsApp customer</a></div></div></div>';
    }).join('');
  }

  /* ---- order drawer ---- */
  function drawerHtml(o) {
    var its = S.items[o.id] || [], evs = S.events[o.id] || [], reqs = S.requests[o.id] || [], live = o.fulfilment === 'live_arrangement';
    var next = V.NEXT[o.order_status] || [];
    var h = '<button class="vo-close" data-act="close" aria-label="Close">×</button><h2>Order ' + V.esc(o.order_no) + '</h2><p class="vo-meta" style="margin:6px 0 12px"><span>Placed ' + V.esc(V.date(o.created_at, true)) + '</span>' + (live ? V.badge('Live pets / fish: arrange pickup or delivery', 'blue') : V.badge('Standard shipping', 'grey')) + '</p>';
    h += '<div class="vo-actions" style="margin-bottom:12px"><a class="vo-btn alt" target="_blank" rel="noopener" href="bill.html?id=' + o.id + '">View / download bill</a></div><div class="vo-badges" style="margin-bottom:12px"><span>Order: ' + V.statusBadge(o) + '</span><span>Payment: ' + V.payBadge(o) + '</span></div>';
    h += '<div class="vo-box"><h3>Customer</h3><dl class="vo-kv"><dt>Name</dt><dd>' + V.esc(o.customer_name) + '</dd><dt>Phone</dt><dd><a href="tel:' + V.esc(o.phone) + '">' + V.esc(o.phone) + '</a> · <a target="_blank" rel="noopener" href="' + V.esc(V.waLink('Hi ' + o.customer_name + ', this is Vimal Pets & Toys about order ' + o.order_no)) + '">WhatsApp</a></dd>' + (o.email ? '<dt>Email</dt><dd>' + V.esc(o.email) + '</dd>' : '') + '<dt>Address</dt><dd>' + V.esc(o.address) + (o.city ? ', ' + V.esc(o.city) : '') + (o.pincode ? ' ' + V.esc(o.pincode) : '') + '</dd>' + (o.customer_note ? '<dt>Customer note</dt><dd>' + V.esc(o.customer_note) + '</dd>' : '') + '</dl></div>';
    h += '<div class="vo-box"><h3>Items</h3><div class="vo-table-wrap"><table class="vo-table"><tbody>' + its.map(function (i) { return '<tr><td>' + V.esc(i.name) + (i.is_live ? ' ' + V.badge('Live', 'blue') : '') + '<br><small>' + V.esc(i.category || '') + '</small></td><td class="r">' + i.qty + ' × ' + V.money(i.unit_price) + '</td><td class="r">' + V.money(i.line_total) + '</td></tr>'; }).join('') + '<tr><td colspan="2" class="r"><b>Total</b></td><td class="r"><b>' + V.money(o.total) + '</b></td></tr></tbody></table></div><p class="vo-note">Prices come from the customer\'s cart. Check them against your price list before you confirm.</p></div>';

    var dupe = o.payment_reference ? S.orders.filter(function (x) { return x.id !== o.id && x.payment_reference && x.payment_reference.toUpperCase() === o.payment_reference.toUpperCase(); }) : [];
    var verifying = o.payment_status === 'pending' || o.payment_status === 'unpaid';
    h += '<div class="vo-box"><h3>1. Payment verification (online payment only)</h3>' +
      '<div class="vo-alert ' + (o.payment_status === 'paid' ? 'ok' : verifying ? 'warn' : 'info') + '" style="margin-bottom:10px">' +
      (o.payment_status === 'paid' ? '<b>Verified and paid.</b>' : o.payment_status === 'pending' ? '<b>Needs verification.</b> The customer submitted a transaction ID.' : o.payment_status === 'unpaid' ? '<b>Waiting for the customer\'s transaction ID.</b>' : '<b>Payment status: ' + V.esc(o.payment_status.replace('_', ' ')) + '.</b>') + '</div>' +
      '<dl class="vo-kv"><dt>Amount to match</dt><dd>' + V.money(o.total) + '</dd><dt>Method</dt><dd>' + V.esc(V.METHOD[o.payment_method] || o.payment_method) + '</dd>' +
      '<dt>Customer\'s ID</dt><dd>' + (o.payment_reference ? V.esc(o.payment_reference) : 'Not submitted yet') + '</dd></dl>' +
      (dupe.length ? '<div class="vo-alert bad" style="margin-top:8px"><b>Warning:</b> this transaction ID is also on order ' + dupe.map(function (x) { return V.esc(x.order_no); }).join(', ') + '. Check for a reused ID before verifying.</div>' : '') +
      '<p class="vo-note">Open your bank or UPI app, find a credit for exactly ' + V.money(o.total) + ' with this ID, then verify. Never mark paid from the customer\'s word alone.</p>' +
      '<div class="vo-two"><div><label>Payment status</label><select id="payStatus">' + PAYS.map(function (k) { return '<option value="' + k + '"' + (o.payment_status === k ? ' selected' : '') + '>' + k.replace('_', ' ') + '</option>'; }).join('') + '</select></div><div><label>Reference / transaction ID</label><input id="payRef" value="' + V.esc(o.payment_reference || '') + '" maxlength="100"></div></div>' +
      '<div class="vo-actions">' + (o.payment_status !== 'paid' && o.order_status === 'pending_payment' ? '<button class="vo-btn good" data-act="verify" data-id="' + o.id + '">Verify payment and confirm order</button><button class="vo-btn warn" data-act="reject" data-id="' + o.id + '">Payment not received</button>' : '') + '<button class="vo-btn alt" data-act="pay" data-id="' + o.id + '">Save payment status</button></div></div>';

    if (live) h += '<div class="vo-box"><h3>2. Availability and arrangement (live pets / fish)</h3><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="availOk" style="width:auto"' + (o.availability_confirmed ? ' checked' : '') + '> I have confirmed these live items are available</label><label>Pickup or delivery arrangement</label><textarea id="arrNote" maxlength="400" placeholder="e.g. Pickup Saturday 5 pm, bagged with oxygen">' + V.esc(o.arrangement_note || '') + '</textarea><div class="vo-actions"><button class="vo-btn" data-act="arr" data-id="' + o.id + '">Save arrangement</button></div></div>';
    else h += '<div class="vo-box"><h3>2. Tracking</h3><div class="vo-two"><div><label>Carrier</label><input id="trCarrier" value="' + V.esc(o.carrier || '') + '" placeholder="DTDC, India Post…" maxlength="60"></div><div><label>Tracking number</label><input id="trNo" value="' + V.esc(o.tracking_number || '') + '" maxlength="60"></div><div><label>Tracking link (optional)</label><input id="trUrl" value="' + V.esc(o.tracking_url || '') + '" placeholder="https://" maxlength="300"></div><div><label>Expected delivery</label><input type="date" id="trEta" value="' + V.esc(o.estimated_delivery || '') + '"></div></div><div class="vo-actions"><button class="vo-btn" data-act="track" data-id="' + o.id + '">Save tracking</button></div></div>';

    h += '<div class="vo-box"><h3>3. Order status</h3>' + (next.length ? '<label>Note (the customer can see this)</label><input id="stNote" maxlength="300"><div class="vo-actions">' + next.map(function (s) { return '<button class="vo-btn ' + (s === 'cancelled' ? 'warn' : s === 'delivered' || s === 'refunded' ? 'good' : '') + '" data-act="status" data-id="' + o.id + '" data-s="' + s + '">Mark ' + V.STATUS[s].label + '</button>'; }).join('') + '</div><p class="vo-note">Only valid next steps are shown. The database blocks anything else.</p>' : '<p class="vo-note">This order is complete.</p>') + '</div>';

    if (reqs.length) h += '<div class="vo-box"><h3>Customer requests</h3><ul class="vo-log">' + reqs.map(function (r) { return '<li><b>' + V.esc(KIND[r.kind] || r.kind) + '</b> · ' + V.badge(r.status.replace('_', ' '), r.status === 'resolved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber') + '<br>' + V.esc(r.message) + '<time>' + V.esc(V.date(r.created_at, true)) + '</time></li>'; }).join('') + '</ul><div class="vo-actions"><button class="vo-btn alt" data-act="gotoreq">Open Requests tab</button></div></div>';
    h += '<div class="vo-box"><h3>Add a note</h3><input id="noteTxt" maxlength="400"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="noteVis" style="width:auto"> Show to customer</label><div class="vo-actions"><button class="vo-btn alt" data-act="note" data-id="' + o.id + '">Add note</button></div></div>';
    h += '<div class="vo-box"><h3>History</h3><ul class="vo-log">' + evs.slice().reverse().map(function (e) { return '<li>' + V.esc(e.kind) + (e.to_value ? ': ' + V.esc(e.from_value ? e.from_value + ' → ' : '') + V.esc(e.to_value) : '') + (e.note ? ' · ' + V.esc(e.note) : '') + ' <small>(' + V.esc(e.actor) + (e.customer_visible ? '' : ', internal') + ')</small><time>' + V.esc(V.date(e.created_at, true)) + '</time></li>'; }).join('') + '</ul></div>';
    return h;
  }
  function openDrawer(id) {
    var o = orderOf(id); if (!o) return; S.sel = id;
    var d = document.getElementById('voDrawer'); d.innerHTML = drawerHtml(o); d.classList.add('open'); document.getElementById('voScrim').classList.add('open');
  }
  function closeDrawer() { S.sel = null; document.getElementById('voDrawer').classList.remove('open'); document.getElementById('voScrim').classList.remove('open'); }
  function $(id) { return document.getElementById(id); }
  async function rpc(fn, args, ok) {
    var r = await sb.rpc(fn, args);
    if (r.error) { alert(V.msg(r.error)); return false; }
    V.toast(ok); await load(true); return true;
  }

  function csv() {
    var rows = filtered(), head = ['order_no', 'date', 'customer', 'phone', 'email', 'type', 'order_status', 'payment_status', 'payment_method', 'total', 'tracking'];
    var out = [head.join(',')].concat(rows.map(function (o) { return [o.order_no, o.created_at, o.customer_name, o.phone, o.email || '', o.fulfilment, o.order_status, o.payment_status, o.payment_method, o.total, o.tracking_number || ''].map(function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(','); }));
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out.join('\n')], { type: 'text/csv' })); a.download = 'vimal-orders.csv'; a.click();
  }

  document.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act'), id = b.getAttribute('data-id');
    if (act === 'tab') { S.tab = b.getAttribute('data-tab'); render(); }
    else if (act === 'open') openDrawer(id);
    else if (act === 'close') closeDrawer();
    else if (act === 'clear') { S.f = { q: '', status: '', pay: '', type: '' }; render(); }
    else if (act === 'csv') csv();
    else if (act === 'rq') { S.rq = b.getAttribute('data-v'); render(); }
    else if (act === 'gotoreq') { closeDrawer(); S.tab = 'requests'; render(); }
    else if (act === 'verify') {
      var ref = $('payRef').value.trim(); if (!ref) { alert('Enter the transaction ID you matched in your bank / UPI app.'); return; }
      if (!confirm('Confirm that you have seen this payment of the full order amount in your bank / UPI records?')) return;
      var rp = await sb.rpc('vp_admin_set_payment', { p_order: id, p_status: 'paid', p_reference: ref, p_note: 'Payment verified by admin' });
      if (rp.error) { alert(V.msg(rp.error)); return; }
      await rpc('vp_admin_set_status', { p_order: id, p_status: 'confirmed', p_note: 'Payment verified. Order confirmed.' }, 'Payment verified and order confirmed');
    }
    else if (act === 'reject') { if (!confirm('Mark this payment as not received? The customer will be asked to check and resend the transaction ID.')) return; await rpc('vp_admin_set_payment', { p_order: id, p_status: 'failed', p_reference: null, p_note: 'Payment could not be verified. Please check the transaction ID and send it again.' }, 'Payment marked as not received'); }
    else if (act === 'pay') await rpc('vp_admin_set_payment', { p_order: id, p_status: $('payStatus').value, p_reference: $('payRef').value, p_note: null }, 'Payment saved');
    else if (act === 'arr') await rpc('vp_admin_set_arrangement', { p_order: id, p_available: $('availOk').checked, p_note: $('arrNote').value }, 'Arrangement saved');
    else if (act === 'track') await rpc('vp_admin_set_tracking', { p_order: id, p_carrier: $('trCarrier').value, p_number: $('trNo').value, p_url: $('trUrl').value || null, p_eta: $('trEta').value || null }, 'Tracking saved');
    else if (act === 'status') { var s = b.getAttribute('data-s'); if (s === 'cancelled' && !confirm('Cancel this order?')) return; await rpc('vp_admin_set_status', { p_order: id, p_status: s, p_note: ($('stNote').value || null) }, 'Status updated'); }
    else if (act === 'note') { if (!$('noteTxt').value.trim()) return; await rpc('vp_admin_add_note', { p_order: id, p_note: $('noteTxt').value, p_visible: $('noteVis').checked }, 'Note added'); }
    else if (act === 'req') { var n = document.querySelector('[data-note="' + id + '"]'); await rpc('vp_admin_resolve_request', { p_request: id, p_status: b.getAttribute('data-s'), p_note: n ? n.value : null }, 'Request updated'); }
    else if (act === 'approve-cancel') {
      var oid = b.getAttribute('data-order'), nn = document.querySelector('[data-note="' + id + '"]');
      if (!confirm('Cancel this order and mark the request resolved?')) return;
      var r1 = await sb.rpc('vp_admin_set_status', { p_order: oid, p_status: 'cancelled', p_note: 'Cancelled at customer request' });
      if (r1.error) { alert(V.msg(r1.error)); return; }
      await rpc('vp_admin_resolve_request', { p_request: id, p_status: 'resolved', p_note: (nn && nn.value) || 'Cancellation approved' }, 'Order cancelled. If it was paid, move it to Refund pending.');
    }
    else if (act === 'svc-save') {
      var st = document.querySelector('[data-svc-status="' + id + '"]').value, w = document.querySelector('[data-svc-when="' + id + '"]').value, nt = document.querySelector('[data-svc-note="' + id + '"]').value;
      await rpc('vp_admin_set_service', { p_id: id, p_status: st, p_scheduled: w ? new Date(w).toISOString() : null, p_note: nt }, 'Service request updated');
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('vo-row')) { e.preventDefault(); openDrawer(e.target.getAttribute('data-id')); } });
  el.addEventListener('input', function (e) { var k = e.target.getAttribute('data-f'); if (k) { S.f[k] = e.target.value; if (k === 'q') { clearTimeout(S.t); S.t = setTimeout(function () { var p = e.target.selectionStart; render(); var i = $('fq'); i.focus(); i.setSelectionRange(p, p); }, 250); } else render(); } });
  document.getElementById('voScrim').addEventListener('click', closeDrawer);
  var lo = document.getElementById('logoutBtn'); if (lo) lo.addEventListener('click', async function () { await sb.auth.signOut(); location.href = 'login.html'; });
  V.requireAdmin().then(function (u) { document.getElementById('voWho').textContent = 'Signed in as ' + u.email; load(); });
})();
