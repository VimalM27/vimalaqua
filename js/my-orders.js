/* My Orders page. Customers can only read their own rows (enforced by the database, not by this script). */
(function () {
  'use strict';
  var V = VPO, sb = supabaseClient;
  var el = document.getElementById('voApp');
  var S = { orders: [], items: {}, events: {}, requests: {}, services: [], tab: 'orders', filter: 'all', open: {}, fresh: new URLSearchParams(location.search).get('new') };
  var DONE = ['delivered', 'cancelled', 'refunded'];
  var SERVICES = { setup: 'Aquarium setup', custom: 'Custom aquarium', maintenance: 'Maintenance', cleaning: 'Cleaning', other: 'Other' };
  var SSTEPS = [['requested', 'Requested'], ['confirmed', 'Confirmed'], ['scheduled', 'Scheduled'], ['completed', 'Completed']];
  var ISSUE = { damaged: 'Damaged item', missing: 'Missing item', incorrect: 'Incorrect item', cancellation: 'Cancellation', support: 'Message' };
  var RSTAT = { open: 'Open', in_review: 'In review', resolved: 'Resolved', rejected: 'Not approved' };

  function group(rows, key) { var m = {}; (rows || []).forEach(function (r) { (m[r[key]] = m[r[key]] || []).push(r); }); return m; }
  function notReady(e) { return e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(e.message || '')); }

  async function load() {
    el.innerHTML = '<p class="vo-empty">Loading your orders…</p>';
    var r = await Promise.all([
      sb.from('vp_orders').select('*').order('created_at', { ascending: false }),
      sb.from('vp_order_items').select('*'),
      sb.from('vp_order_events').select('*').order('created_at', { ascending: true }),
      sb.from('vp_order_requests').select('*').order('created_at', { ascending: false }),
      sb.from('vp_service_requests').select('*').order('created_at', { ascending: false })
    ]);
    var err = r.map(function (x) { return x.error; }).filter(Boolean)[0];
    if (err) {
      el.innerHTML = '<div class="vo-alert bad">' + (notReady(err) ? 'Orders are not switched on yet. Please contact Vimal Pets &amp; Toys.' : 'We could not load your orders: ' + V.esc(V.msg(err))) + '</div>';
      return;
    }
    S.orders = r[0].data || []; S.items = group(r[1].data, 'order_id'); S.events = group(r[2].data, 'order_id');
    S.requests = group(r[3].data, 'order_id'); S.services = r[4].data || [];
    if (S.fresh) { var f = S.orders.filter(function (o) { return o.order_no === S.fresh; })[0]; if (f) S.open[f.id] = true; }
    render();
  }

  function exampleCard() {
    var o = { order_status: 'processing', payment_method: 'cod', payment_status: 'unpaid', fulfilment: 'shipping', tracking_number: null };
    return '<div class="vo-example"><span class="tag">Example design</span>' +
      '<div class="vo-no">Order #VM27001 ' + V.badge('Processing', 'blue') + '</div><div class="vo-meta" style="margin:6px 0 14px"><span>Placed: 20 October 2026</span></div>' +
      V.timeline(o) + '<p class="vo-note">Illustrative example only. This is not a real customer order.</p></div>';
  }

  function orderCard(o) {
    var its = S.items[o.id] || [], open = !!S.open[o.id], qty = its.reduce(function (n, i) { return n + i.qty; }, 0);
    var h = '<article class="vo-card' + (open ? ' open' : '') + '" data-id="' + o.id + '">' +
      '<button type="button" class="vo-card-top" data-act="toggle" aria-expanded="' + open + '">' +
      '<span><span class="vo-no">Order #' + V.esc(o.order_no) + '</span><span class="vo-meta"><span>Placed: ' + V.esc(V.date(o.created_at)) + '</span><span>' + qty + ' item' + (qty === 1 ? '' : 's') + '</span><span>' + V.money(o.total) + '</span></span></span>' +
      '<span class="vo-badges"><span>Order: ' + V.statusBadge(o) + '</span><span>Payment: ' + V.payBadge(o) + '</span></span></button>';
    h += '<div class="vo-body">' + (open ? detail(o, its) : '') + '</div></article>';
    return h;
  }

  function detail(o, its) {
    var evs = S.events[o.id] || [], reqs = S.requests[o.id] || [], live = o.fulfilment === 'live_arrangement';
    var canCancel = ['pending_payment', 'confirmed', 'processing'].indexOf(o.order_status) >= 0 && !reqs.some(function (r) { return r.kind === 'cancellation' && (r.status === 'open' || r.status === 'in_review'); });
    var canReport = ['shipped', 'out_for_delivery', 'delivered'].indexOf(o.order_status) >= 0;
    var h = '';
    if (S.fresh === o.order_no) h += '<div class="vo-alert ok">Thank you! Your order ' + V.esc(o.order_no) + ' has been received. We will contact you shortly. <a href="bill.html?id=' + o.id + '"><b>Download your bill</b></a></div>';
    if (o.order_status === 'cancelled') h += '<div class="vo-alert bad">This order was cancelled.' + (o.payment_status === 'refund_pending' ? ' Your refund is pending.' : '') + '</div>';
    if (o.order_status === 'refund_pending') h += '<div class="vo-alert warn">Your refund has been started but is not complete yet.</div>';
    if (o.order_status === 'refunded') h += '<div class="vo-alert info">Your refund has been completed.</div>';
    if (live) h += '<div class="vo-alert info">This order includes live pets or fish. We confirm availability first and then arrange pickup or delivery with you. It is not a normal courier parcel.</div>';
    h += '<div class="vo-grid2"><div>';
    h += '<div class="vo-box"><h3>Delivery progress</h3>' + V.timeline(o) + '</div>';
    if (!live && o.tracking_number) {
      h += '<div class="vo-box"><h3>Tracking</h3><dl class="vo-kv"><dt>Carrier</dt><dd>' + V.esc(o.carrier || 'Courier') + '</dd><dt>Tracking no.</dt><dd>' + V.esc(o.tracking_number) + '</dd>' +
        (o.estimated_delivery ? '<dt>Expected by</dt><dd>' + V.esc(V.date(o.estimated_delivery)) + '</dd>' : '') + '</dl>' +
        (/^https?:\/\//i.test(o.tracking_url || '') ? '<div class="vo-actions"><a class="vo-btn alt" href="' + V.esc(o.tracking_url) + '" target="_blank" rel="noopener">Track parcel</a></div>' : '') + '</div>';
    } else if (!live && (o.order_status === 'shipped' || o.order_status === 'out_for_delivery')) {
      h += '<div class="vo-box"><h3>Tracking</h3><p class="vo-note">Your parcel is on its way. Tracking details will appear here when available.</p></div>';
    }
    if (live) h += '<div class="vo-box"><h3>Pickup or delivery</h3><dl class="vo-kv"><dt>Availability</dt><dd>' + (o.availability_confirmed ? 'Confirmed' : 'Being confirmed') + '</dd><dt>Arrangement</dt><dd>' + V.esc(o.arrangement_note || 'We will contact you to arrange this') + '</dd></dl></div>';
    h += '</div><div>';
    h += '<div class="vo-box"><h3>Items</h3><div class="vo-table-wrap"><table class="vo-table"><thead><tr><th>Product</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>' +
      its.map(function (i) { return '<tr><td>' + V.esc(i.name) + '</td><td class="r">' + i.qty + '</td><td class="r">' + V.money(i.unit_price) + '</td><td class="r">' + V.money(i.line_total) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><td colspan="3" class="r"><b>Order total</b></td><td class="r"><b>' + V.money(o.total) + '</b></td></tr></tfoot></table></div></div>';
    h += '<div class="vo-box"><h3>Payment</h3><dl class="vo-kv"><dt>Status</dt><dd>' + V.payBadge(o) + '</dd><dt>Method</dt><dd>' + V.esc(V.METHOD[o.payment_method] || o.payment_method) + '</dd>' +
      (o.payment_reference ? '<dt>Reference</dt><dd>' + V.esc(o.payment_reference) + '</dd>' : '') + (o.paid_at ? '<dt>Paid on</dt><dd>' + V.esc(V.date(o.paid_at)) + '</dd>' : '') + '</dl>' +
      (o.payment_status === 'unpaid' && V.prepaid(o) ? '<p class="vo-note">We will confirm your payment manually. Your order is not marked paid until we verify it.</p>' : '') + '</div>';
    h += '<div class="vo-box"><h3>Delivery address</h3><p>' + V.esc(o.customer_name) + '<br>' + V.esc(o.address) + (o.city ? ', ' + V.esc(o.city) : '') + (o.pincode ? ' ' + V.esc(o.pincode) : '') + '<br>' + V.esc(o.phone) + '</p></div>';
    h += '</div></div>';

    h += '<div class="vo-actions"><a class="vo-btn good" href="bill.html?id=' + o.id + '">⬇ Download bill</a>' +
      (canCancel ? '<button class="vo-btn warn" data-act="form" data-form="cancel">Request cancellation</button>' : '') +
      (canReport ? '<button class="vo-btn alt" data-act="form" data-form="issue">Report a problem</button>' : '') +
      '<button class="vo-btn alt" data-act="form" data-form="support">Contact support</button>' +
      '<a class="vo-btn alt" target="_blank" rel="noopener" href="' + V.esc(V.waLink('Hi Vimal Pets & Toys, I need help with order ' + o.order_no)) + '">WhatsApp about this order</a></div>';
    if (!canCancel && ['pending_payment', 'confirmed', 'processing'].indexOf(o.order_status) < 0 && ['shipped', 'out_for_delivery'].indexOf(o.order_status) >= 0) h += '<p class="vo-note">Cancellation is no longer available because the order has been dispatched. You can report a problem or contact support.</p>';

    h += '<form class="vo-form" hidden data-form-id="cancel" data-order="' + o.id + '"><h3>Request cancellation</h3><label>Reason (optional)</label><textarea name="message" maxlength="500" placeholder="Why would you like to cancel?"></textarea><div class="vo-actions"><button class="vo-btn warn" type="submit">Send cancellation request</button></div><p class="vo-note">Our team will review it. We will confirm once it is approved.</p></form>';
    h += '<form class="vo-form" hidden data-form-id="issue" data-order="' + o.id + '"><h3>Report a problem</h3><div class="vo-two"><div><label>What happened?</label><select name="kind"><option value="damaged">Item arrived damaged</option><option value="missing">Item is missing</option><option value="incorrect">Wrong item received</option></select></div><div><label>Which item?</label><select name="item"><option value="">Whole order</option>' + its.map(function (i) { return '<option value="' + i.id + '">' + V.esc(i.name) + '</option>'; }).join('') + '</select></div></div><label>Details</label><textarea name="message" required minlength="3" maxlength="1000" placeholder="Tell us what went wrong"></textarea><div class="vo-actions"><button class="vo-btn" type="submit">Submit report</button></div></form>';
    h += '<form class="vo-form" hidden data-form-id="support" data-order="' + o.id + '"><h3>Contact support about ' + V.esc(o.order_no) + '</h3><label>Your message</label><textarea name="message" required minlength="3" maxlength="1000"></textarea><div class="vo-actions"><button class="vo-btn" type="submit">Send message</button></div></form>';

    if (reqs.length) h += '<div class="vo-box" style="margin-top:14px"><h3>Your requests</h3><ul class="vo-log">' + reqs.map(function (r) {
      return '<li><b>' + V.esc(ISSUE[r.kind] || r.kind) + '</b> · ' + V.badge(RSTAT[r.status] || r.status, r.status === 'resolved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber') + '<br>' + V.esc(r.message) + (r.admin_note ? '<br><i>Reply: ' + V.esc(r.admin_note) + '</i>' : '') + '<time>' + V.esc(V.date(r.created_at, true)) + '</time></li>';
    }).join('') + '</ul></div>';
    if (evs.length) h += '<div class="vo-box"><h3>Activity</h3><ul class="vo-log">' + evs.map(function (e) {
      var t = e.kind === 'status' ? 'Order status: ' + ((V.STATUS[e.to_value] || {}).label || e.to_value) : e.kind === 'payment' ? 'Payment: ' + e.to_value.replace('_', ' ') : e.kind === 'tracking' ? 'Tracking added' : e.note || e.kind;
      return '<li>' + V.esc(t) + (e.note && e.kind !== 'placed' ? ' <span style="color:#5b6592">· ' + V.esc(e.note) + '</span>' : '') + '<time>' + V.esc(V.date(e.created_at, true)) + '</time></li>';
    }).join('') + '</ul></div>';
    return h;
  }

  function servicesView() {
    var h = '<div class="vo-actions" style="margin-bottom:14px"><button class="vo-btn" data-act="svc-new">Request a service</button></div>';
    h += '<form class="vo-form" hidden id="svcForm"><h3>Aquarium service request</h3><div class="vo-two"><div><label>Service</label><select name="service">' + Object.keys(SERVICES).map(function (k) { return '<option value="' + k + '">' + SERVICES[k] + '</option>'; }).join('') + '</select></div><div><label>Preferred date</label><input type="date" name="date" min="' + new Date().toISOString().slice(0, 10) + '"></div><div><label>Your name</label><input name="name" required maxlength="120"></div><div><label>Mobile number</label><input name="phone" required pattern="[0-9]{10}" maxlength="10" inputmode="numeric"></div></div><label>Address</label><input name="address" maxlength="300"><label>Details (tank size, issue, etc.)</label><textarea name="details" maxlength="1000"></textarea><div class="vo-actions"><button class="vo-btn" type="submit">Send request</button></div><p class="vo-note">This is a service request, not an order. We will confirm a time with you.</p></form>';
    if (!S.services.length) return h + '<p class="vo-empty">No service requests yet.</p>';
    return h + S.services.map(function (s) {
      var idx = SSTEPS.map(function (x) { return x[0]; }).indexOf(s.status);
      var steps = s.status === 'cancelled' ? V.badge('Cancelled', 'red') : '<ol class="vo-steps" style="display:flex;gap:18px;flex-wrap:wrap">' + SSTEPS.map(function (x, i) {
        var cls = i < idx || s.status === 'completed' ? 'done' : i === idx ? 'current' : 'todo';
        return '<li class="vo-step vo-' + cls + '" style="padding:0"><span class="vo-dot">' + (cls === 'done' ? '✓' : '') + '</span><div><b>' + x[1] + '</b></div></li>';
      }).join('') + '</ol>';
      return '<article class="vo-card"><div class="vo-card-top" style="cursor:default"><span><span class="vo-no">' + V.esc(SERVICES[s.service] || s.service) + '</span><span class="vo-meta"><span>Requested: ' + V.esc(V.date(s.created_at)) + '</span>' + (s.preferred_date ? '<span>Preferred: ' + V.esc(V.date(s.preferred_date)) + '</span>' : '') + (s.scheduled_for ? '<span>Scheduled: ' + V.esc(V.date(s.scheduled_for, true)) + '</span>' : '') + '</span></span></div><div class="vo-body" style="display:block">' + steps + (s.details ? '<p class="vo-note">' + V.esc(s.details) + '</p>' : '') + (s.admin_note ? '<p class="vo-note"><b>From Vimal:</b> ' + V.esc(s.admin_note) + '</p>' : '') + '</div></article>';
    }).join('');
  }

  function render() {
    var cur = S.orders.filter(function (o) { return DONE.indexOf(o.order_status) < 0; }), past = S.orders.filter(function (o) { return DONE.indexOf(o.order_status) >= 0; });
    var list = S.filter === 'current' ? cur : S.filter === 'past' ? past : S.orders;
    var h = '<div class="vo-tabs" role="tablist"><button class="vo-tab' + (S.tab === 'orders' ? ' on' : '') + '" data-act="tab" data-tab="orders">Orders</button><button class="vo-tab' + (S.tab === 'services' ? ' on' : '') + '" data-act="tab" data-tab="services">Service requests</button></div>';
    if (S.tab === 'services') { el.innerHTML = h + servicesView(); return; }
    h += '<div class="vo-tabs"><button class="vo-tab' + (S.filter === 'all' ? ' on' : '') + '" data-act="filter" data-f="all">All (' + S.orders.length + ')</button><button class="vo-tab' + (S.filter === 'current' ? ' on' : '') + '" data-act="filter" data-f="current">Current (' + cur.length + ')</button><button class="vo-tab' + (S.filter === 'past' ? ' on' : '') + '" data-act="filter" data-f="past">Previous (' + past.length + ')</button></div>';
    if (!S.orders.length) h += exampleCard() + '<div class="vo-empty">You have not placed any orders yet.<div class="vo-actions" style="justify-content:center;margin-top:12px"><a class="vo-btn" href="index.html">Start shopping</a></div></div>';
    else h += list.length ? list.map(orderCard).join('') : '<p class="vo-empty">No orders in this view.</p>';
    el.innerHTML = h;
  }

  async function call(fn, args, ok) {
    var r = await sb.rpc(fn, args);
    if (r.error) { alert(V.msg(r.error)); return false; }
    V.toast(ok); await load(); return true;
  }

  el.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act'), card = b.closest('.vo-card');
    if (act === 'toggle') { var id = card.getAttribute('data-id'); S.open[id] = !S.open[id]; render(); }
    else if (act === 'tab') { S.tab = b.getAttribute('data-tab'); render(); }
    else if (act === 'filter') { S.filter = b.getAttribute('data-f'); render(); }
    else if (act === 'form') { var f = card.querySelector('[data-form-id="' + b.getAttribute('data-form') + '"]'); card.querySelectorAll('.vo-form').forEach(function (x) { if (x !== f) x.hidden = true; }); f.hidden = !f.hidden; if (!f.hidden) f.scrollIntoView({ block: 'nearest' }); }
    else if (act === 'svc-new') { var sf = document.getElementById('svcForm'); sf.hidden = !sf.hidden; }
  });
  el.addEventListener('submit', async function (e) {
    var f = e.target; e.preventDefault();
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      var id = f.getAttribute('data-order'), kind = f.getAttribute('data-form-id'), d = new FormData(f);
      if (kind === 'cancel') await call('vp_request_cancellation', { p_order: id, p_reason: d.get('message') || '' }, 'Cancellation request sent');
      else if (kind === 'issue') await call('vp_report_issue', { p_order: id, p_kind: d.get('kind'), p_item: d.get('item') || null, p_message: d.get('message') }, 'Report sent. We will get back to you.');
      else if (kind === 'support') await call('vp_contact_support', { p_order: id, p_message: d.get('message') }, 'Message sent to support');
      else if (f.id === 'svcForm') {
        var r = await sb.from('vp_service_requests').insert({ user_id: S.user.id, service: d.get('service'), name: d.get('name'), phone: d.get('phone'), address: d.get('address') || null, preferred_date: d.get('date') || null, details: d.get('details') || null });
        if (r.error) alert(V.msg(r.error)); else { V.toast('Service request sent'); await load(); }
      }
    } finally { btn.disabled = false; }
  });

  V.requireUser().then(function (u) { S.user = u; if (new URLSearchParams(location.search).get('tab') === 'services') S.tab = 'services'; load(); });
})();
