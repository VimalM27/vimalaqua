/* Bill page: builds the bill from the real order and lets the customer download it as a PDF.
   Customers can only open their own orders (database rule); admins can open any. */
(function () {
  'use strict';
  var V = VPO, sb = supabaseClient, root = document.getElementById('voApp');
  var CFG = Object.assign({ name: 'Vimal Pets & Toys', address: 'Coimbatore, Tamil Nadu, India', phone: '+91 78 4545 2727', email: 'vimal@vimal27.in', website: 'www.vimal27.in', gstin: '' }, window.VPW_BILL || {});

  /* amount in words, Indian system */
  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); }
  function three(n) { return (n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : ''); }
  function words(n) {
    n = Math.round(Number(n) * 100) / 100;
    var r = Math.floor(n), p = Math.round((n - r) * 100);
    if (r === 0 && p === 0) return 'Zero Rupees Only';
    var parts = [], c = Math.floor(r / 10000000); r %= 10000000;
    var l = Math.floor(r / 100000); r %= 100000; var t = Math.floor(r / 1000); r %= 1000;
    if (c) parts.push(three(c) + ' Crore'); if (l) parts.push(three(l) + ' Lakh'); if (t) parts.push(three(t) + ' Thousand'); if (r) parts.push(three(r));
    var s = parts.join(' ') || 'Zero';
    return s + ' Rupees' + (p ? ' and ' + two(p) + ' Paise' : '') + ' Only';
  }

  var PAYTXT = { unpaid: 'Not yet paid', pending: 'Being verified', paid: 'Paid', failed: 'Payment failed', refund_pending: 'Refund pending', refunded: 'Refunded' };
  function stamp(o) {
    if (o.order_status === 'cancelled') return ['CANCELLED', 'red'];
    if (o.order_status === 'refunded') return ['REFUNDED', 'grey'];
    if (o.order_status === 'refund_pending') return ['REFUND PENDING', 'amber'];
    if (o.payment_status === 'paid') return ['PAID', 'green'];
    if (o.payment_status === 'failed') return ['PAYMENT FAILED', 'red'];
    if (o.payment_method === 'cod') return ['PAY ON DELIVERY', 'amber'];
    if (o.payment_method === 'pay_at_pickup') return ['PAY AT PICKUP', 'amber'];
    return ['PAYMENT PENDING', 'amber'];
  }

  function sheet(o, its) {
    var st = stamp(o), sub = Number(o.subtotal) || its.reduce(function (n, i) { return n + Number(i.line_total); }, 0), ship = Number(o.shipping_fee) || 0, total = Number(o.total);
    var pay = V.METHOD[o.payment_method] || o.payment_method;
    var h = '<div id="billSheet"><div class="vb-head"><img src="images/vimallogo.png" alt="' + V.esc(CFG.name) + '" crossorigin="anonymous"><div class="vb-title"><h1>BILL / INVOICE</h1><p>Bill no. ' + V.esc(o.order_no) + '</p><span class="vb-stamp vb-' + st[1] + '">' + st[0] + '</span></div></div>' +
      '<div class="vb-body">' +
      '<div class="vb-meta"><div><h4>Sold by</h4><p><b>' + V.esc(CFG.name) + '</b><br>' + V.esc(CFG.address) + '<br>' + V.esc(CFG.phone) + '<br>' + V.esc(CFG.email) + (CFG.gstin ? '<br>GSTIN: ' + V.esc(CFG.gstin) : '') + '</p></div>' +
      '<div><h4>Billed to</h4><p><b>' + V.esc(o.customer_name) + '</b><br>' + V.esc(o.address) + (o.city ? ', ' + V.esc(o.city) : '') + (o.pincode ? ' ' + V.esc(o.pincode) : '') + '<br>' + V.esc(o.phone) + (o.email ? '<br>' + V.esc(o.email) : '') + '</p></div>' +
      '<div><h4>Order details</h4><p>Order no: <b>' + V.esc(o.order_no) + '</b><br>Date: ' + V.esc(V.date(o.created_at)) + '<br>Payment: ' + V.esc(pay) + '<br>Payment status: <span class="vb-chip vb-' + ({ paid: 'green', failed: 'red', refunded: 'grey' }[o.payment_status] || 'amber') + '">' + V.esc(PAYTXT[o.payment_status] || o.payment_status) + '</span>' + (o.payment_reference ? '<br>Ref: ' + V.esc(o.payment_reference) : '') + '</p></div></div>' +
      '<table class="vb-table"><thead><tr><th style="width:34px">#</th><th>Product</th><th class="n">Qty</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead><tbody>' +
      its.map(function (i, k) { return '<tr><td>' + (k + 1) + '</td><td>' + V.esc(i.name) + (i.category ? '<small>' + V.esc(i.category) + (i.is_live ? ' · Live' : '') + '</small>' : '') + '</td><td class="n">' + i.qty + '</td><td class="n">' + V.money(i.unit_price) + '</td><td class="n">' + V.money(i.line_total) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<div class="vb-sum"><div class="vb-words"><b>Amount in words</b><br>' + V.esc(words(total)) + '</div><div class="vb-totals"><div><span>Subtotal</span><span>' + V.money(sub) + '</span></div>' + (ship ? '<div><span>Delivery</span><span>' + V.money(ship) + '</span></div>' : '') + '<div class="grand"><span>Total</span><span>' + V.money(total) + '</span></div></div></div>' +
      (o.fulfilment === 'live_arrangement' ? '<div class="vb-note"><b>Live pets and fish:</b> pickup or delivery is arranged with you by our team after availability is confirmed.</div>' : '') +
      '<div class="vb-note">Returns and refunds follow our Return &amp; Refund Policy at ' + V.esc(CFG.website) + '. Please keep this bill for your reference. Contact us on ' + V.esc(CFG.phone) + ' for any help with order ' + V.esc(o.order_no) + '.</div></div>' +
      '<div class="vb-foot"><b>Thank you for shopping with ' + V.esc(CFG.name) + '!</b><br>This is a computer-generated bill and does not need a signature.</div></div>';
    return h;
  }

  function loadPdfLib() {
    if (window.html2pdf) return Promise.resolve();
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'js/vendor/html2pdf.bundle.min.js'; s.onload = res; s.onerror = function () { rej(new Error('Could not load the PDF tool')); }; document.head.appendChild(s); });
  }
  async function download(o, btn) {
    var label = btn.textContent; btn.disabled = true; btn.textContent = 'Preparing PDF…';
    try {
      await loadPdfLib();
      var el = document.getElementById('billSheet');
      await new Promise(function (r) { var img = el.querySelector('img'); if (!img || img.complete) r(); else { img.onload = r; img.onerror = r; } });
      await html2pdf().set({ margin: 0, filename: 'Vimal-Bill-' + o.order_no + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'legacy'] } }).from(el).save();
      V.toast('Bill downloaded');
    } catch (e) { alert(V.msg(e)); }
    btn.disabled = false; btn.textContent = label;
  }

  async function init() {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) { root.innerHTML = '<div class="vo-empty">No order selected. <a href="my-orders.html">Go to My Orders</a></div>'; return; }
    var r = await Promise.all([sb.from('vp_orders').select('*').eq('id', id).maybeSingle(), sb.from('vp_order_items').select('*').eq('order_id', id)]);
    var o = r[0].data;
    if (r[0].error || !o) { root.innerHTML = '<div class="vo-empty">We could not find this order. <a href="my-orders.html">Go to My Orders</a></div>'; return; }
    var its = r[1].data || [];
    root.innerHTML = '<div class="vb-bar"><button class="vo-btn" id="vbDl">⬇ Download PDF</button><button class="vo-btn alt" id="vbPrint">Print</button><a class="vo-btn alt" href="my-orders.html">Back to My Orders</a></div><div class="vb-wrap">' + sheet(o, its) + '</div>';
    document.title = 'Bill ' + o.order_no + ' | Vimal Pets & Toys';
    document.getElementById('vbDl').addEventListener('click', function () { download(o, this); });
    document.getElementById('vbPrint').addEventListener('click', function () { window.print(); });
    if (new URLSearchParams(location.search).get('download') === '1') document.getElementById('vbDl').click();
  }
  V.requireUser().then(init);
})();
