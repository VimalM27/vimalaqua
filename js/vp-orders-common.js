/* Vimal Pets & Toys: shared order helpers (customer + admin pages). Needs js/supabaseClient.js first. */
(function () {
  'use strict';
  var STATUS = {
    pending_payment:  { label: 'Pending payment',  tone: 'amber', hint: 'Payment not yet confirmed' },
    confirmed:        { label: 'Confirmed',        tone: 'blue',  hint: 'Order accepted' },
    processing:       { label: 'Processing',       tone: 'blue',  hint: 'Being prepared' },
    shipped:          { label: 'Shipped',          tone: 'violet', hint: 'Handed to the carrier' },
    out_for_delivery: { label: 'Out for delivery', tone: 'violet', hint: 'Delivery is underway' },
    delivered:        { label: 'Delivered',        tone: 'green', hint: 'Delivery confirmed' },
    cancelled:        { label: 'Cancelled',        tone: 'red',   hint: 'Order cancelled' },
    refund_pending:   { label: 'Refund pending',   tone: 'amber', hint: 'Refund started, not completed' },
    refunded:         { label: 'Refunded',         tone: 'grey',  hint: 'Refund confirmed' }
  };
  var PAY_TONE = { unpaid: 'amber', pending: 'amber', paid: 'green', failed: 'red', refund_pending: 'amber', refunded: 'grey' };
  var METHOD = { cod: 'Pay on delivery', pay_at_pickup: 'Pay at pickup', upi: 'UPI / bank transfer', online: 'Online payment' };
  var NEXT = { /* which statuses an admin may move to (the database enforces this too) */
    pending_payment: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'out_for_delivery', 'delivered', 'cancelled'], shipped: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'], delivered: ['refund_pending'], cancelled: ['refund_pending'], refund_pending: ['refunded'], refunded: []
  };

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { n = Number(n) || 0; return '₹' + n.toLocaleString('en-IN', Math.abs(n - Math.round(n)) < .005 ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function date(d, withTime) {
    if (!d) return '';
    var x = new Date(d); if (isNaN(x)) return '';
    return x.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + (withTime ? ', ' + x.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '');
  }
  function prepaid(o) { return o.payment_method === 'upi' || o.payment_method === 'online'; }
  function statusLabel(o) {
    if (o.order_status === 'pending_payment' && !prepaid(o)) return 'Awaiting confirmation';
    return STATUS[o.order_status] ? STATUS[o.order_status].label : o.order_status;
  }
  function payLabel(o) {
    switch (o.payment_status) {
      case 'unpaid': return o.payment_method === 'cod' ? 'Pay on delivery' : o.payment_method === 'pay_at_pickup' ? 'Pay at pickup' : 'Awaiting payment';
      case 'pending': return 'Payment being verified';
      case 'paid': return 'Paid';
      case 'failed': return 'Payment failed';
      case 'refund_pending': return 'Refund pending';
      case 'refunded': return 'Refunded';
      default: return o.payment_status;
    }
  }
  function badge(text, tone) { return '<span class="vo-badge vo-' + (tone || 'grey') + '">' + esc(text) + '</span>'; }
  function statusBadge(o) { return badge(statusLabel(o), (STATUS[o.order_status] || {}).tone); }
  function payBadge(o) { return badge(payLabel(o), PAY_TONE[o.payment_status]); }

  /* customer timeline: 4 steps, wording follows the design brief */
  function timeline(o) {
    var live = o.fulfilment === 'live_arrangement', st = o.order_status;
    var steps = live ? [
      ['Order placed', 'Order received successfully'],
      ['Confirmed', o.availability_confirmed ? 'Availability confirmed' : 'We are confirming availability'],
      ['Out for delivery or pickup', o.arrangement_note || 'We will arrange this with you'],
      ['Delivered', 'Confirmed delivery']
    ] : [
      ['Order placed', 'Order received successfully'],
      ['Processing', st === 'pending_payment' ? (prepaid(o) ? 'Waiting for payment confirmation' : 'Waiting for our confirmation') : 'Preparing the order'],
      ['Shipped', o.tracking_number ? 'Tracking details are available' : 'Tracking details appear when available'],
      ['Delivered', 'Confirmed delivery']
    ];
    var stopped = st === 'cancelled' || st === 'refund_pending' || st === 'refunded';
    var cur;
    if (live) cur = { pending_payment: 1, confirmed: 2, processing: 2, shipped: 2, out_for_delivery: 2, delivered: 4 }[st];
    else cur = { pending_payment: 1, confirmed: 1, processing: 1, shipped: 2, out_for_delivery: 2, delivered: 4 }[st];
    if (cur == null) cur = stopped && o.delivered_at ? 4 : 1;
    var html = '<ol class="vo-steps" aria-label="Order progress">';
    steps.forEach(function (s, i) {
      var cls = stopped ? (i === 0 || (o.delivered_at && i <= 3) ? 'done' : 'todo') : (i < cur ? 'done' : (i === cur ? 'current' : 'todo'));
      html += '<li class="vo-step vo-' + cls + '"><span class="vo-dot" aria-hidden="true">' + (cls === 'done' ? '✓' : '') + '</span><div><b>' + esc(s[0]) + '</b><small>' + esc(s[1]) + '</small></div></li>';
    });
    return html + '</ol>';
  }

  function nextUrl() { return encodeURIComponent(location.pathname.split('/').pop() + location.search); }
  function requireUser() {
    return supabaseClient.auth.getUser().then(function (r) {
      var u = r && r.data && r.data.user;
      if (!u) { location.href = 'login.html?next=' + nextUrl(); return new Promise(function () {}); }
      return u;
    });
  }
  function requireAdmin() {
    return requireUser().then(function (u) {
      return supabaseClient.from('user_roles').select('role').eq('user_id', u.id).eq('role', 'admin').maybeSingle().then(function (r) {
        if (r.error || !r.data) { alert('Access denied. Admins only.'); location.href = 'index.html'; return new Promise(function () {}); }
        return u;
      });
    });
  }
  function waLink(text) { return 'https://wa.me/' + ((window.VPW_ORDERS && window.VPW_ORDERS.whatsapp) || '917845452727') + '?text=' + encodeURIComponent(text); }
  function msg(e) { return (e && (e.message || e.error_description)) || 'Something went wrong. Please try again.'; }
  function toast(t) { var d = document.createElement('div'); d.className = 'vo-toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3500); }

  window.VPO = { STATUS: STATUS, METHOD: METHOD, NEXT: NEXT, esc: esc, money: money, date: date, statusLabel: statusLabel, payLabel: payLabel,
    badge: badge, statusBadge: statusBadge, payBadge: payBadge, timeline: timeline, requireUser: requireUser, requireAdmin: requireAdmin, waLink: waLink, msg: msg, prepaid: prepaid, toast: toast };
})();
