/* Customer checkout: turns the cart into a real order. Payment is NEVER marked paid here. */
(function () {
  'use strict';
  var V = VPO, sb = supabaseClient, root = document.getElementById('voApp');
  var CFG = window.VPW_ORDERS || {};
  function parse(v) { var m = String(v == null ? '' : v).replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; }

  function lines() {
    var cart = []; try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) {}
    return cart.map(function (c) {
      var rec = window.VPW && VPW.getProduct(VPW.slugify(c.name));
      var price = rec ? rec.price : parse(c.price);
      var problem = null;
      if (rec && rec._state === 'out_of_stock') problem = 'Out of stock';
      else if ((rec && (rec.priceOnRequest || rec.price == null)) || price == null) problem = 'Price on request. Please contact us';
      return { slug: rec ? rec.slug : (window.VPW ? VPW.slugify(c.name) : ''), name: rec ? rec.name : c.name, category: rec ? rec.category : 'Products', qty: Math.max(1, parseInt(c.qty, 10) || 1),
        unit_price: price, is_live: !!(rec && rec.type === 'pet'), image: c.image || (rec && rec.images && rec.images[0]) || '', problem: problem };
    });
  }

  function render(user) {
    var L = lines();
    if (!L.length) { root.innerHTML = '<div class="vo-empty">Your cart is empty.<div class="vo-actions" style="justify-content:center;margin-top:12px"><a class="vo-btn" href="index.html">Continue shopping</a></div></div>'; return; }
    var bad = L.filter(function (l) { return l.problem; });
    var total = L.reduce(function (n, l) { return n + (l.unit_price || 0) * l.qty; }, 0), live = L.some(function (l) { return l.is_live; });
    var meta = user.user_metadata || {};
    var upiId = CFG.upiId || 'vimalfarms@upi', payee = CFG.payeeName || 'Vimal Pets & Toys';
    var upiUrl = 'upi://pay?pa=' + encodeURIComponent(upiId) + '&pn=' + encodeURIComponent(payee) + '&am=' + total.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent('Vimal order');
    var qr = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(upiUrl);
    var h = '';
    if (live) h += '<div class="vo-alert info"><b>Live pets and fish.</b> We confirm availability first, then arrange pickup or delivery with you. Payment is online only and is verified before we arrange anything.</div>';
    if (bad.length) h += '<div class="vo-alert bad">Please remove these items from your cart before ordering: ' + bad.map(function (b) { return V.esc(b.name) + ' (' + V.esc(b.problem) + ')'; }).join(', ') + '. <a href="cart.html">Open cart</a></div>';
    h += '<div class="vo-grid2"><form id="coForm" class="vo-box" novalidate><h3>Delivery details</h3>' +
      '<label for="coName">Full name</label><input id="coName" name="name" required maxlength="120" value="' + V.esc(meta.name || '') + '" autocomplete="name">' +
      '<div class="vo-two"><div><label for="coPhone">Mobile number</label><input id="coPhone" name="phone" required pattern="[0-9]{10}" maxlength="10" inputmode="numeric" value="' + V.esc(meta.phone || '') + '" autocomplete="tel"></div><div><label for="coEmail">Email (optional)</label><input id="coEmail" name="email" type="email" value="' + V.esc(user.email || '') + '" autocomplete="email"></div></div>' +
      '<label for="coAddr">Address</label><textarea id="coAddr" name="address" required maxlength="400" autocomplete="street-address"></textarea>' +
      '<div class="vo-two"><div><label for="coCity">City</label><input id="coCity" name="city" maxlength="80" value="Coimbatore"></div><div><label for="coPin">Pincode</label><input id="coPin" name="pincode" maxlength="10" inputmode="numeric"></div></div>' +
      '<label for="coNote">Note for us (optional)</label><textarea id="coNote" name="note" maxlength="500"></textarea>' +
      '<h3 style="margin-top:16px">Online payment (UPI / bank transfer)</h3>' +
      '<div class="vo-box" style="text-align:center"><p class="vo-note" style="margin:0 0 8px"><b>Online payment only.</b> Pay <b>' + V.money(total) + '</b> online, then enter the transaction ID below.</p>' +
      '<img src="' + qr + '" alt="UPI QR code for ' + V.esc(V.money(total)) + '" width="200" height="200" style="max-width:100%;border-radius:10px;background:#fff;padding:6px">' +
      '<p style="margin-top:8px">Scan with GPay, PhonePe, Paytm or any UPI app<br>or pay to UPI ID <b id="coUpi">' + V.esc(upiId) + '</b> <button type="button" class="vo-btn alt" id="coCopy" style="padding:3px 10px;font-size:12px">Copy</button></p>' +
      '<a class="vo-btn alt" href="' + V.esc(upiUrl) + '" style="margin-top:6px;display:inline-block">Open UPI app</a></div>' +
      '<label for="coRef">UPI transaction ID / UTR (from your payment confirmation)</label><input id="coRef" name="reference" required minlength="8" maxlength="30" autocomplete="off" placeholder="e.g. 412345678901">' +
      '<p class="vo-note">Your order is placed as <b>payment under verification</b>. It is never marked paid automatically: our team checks the transaction ID against our bank / UPI records first, and only then confirms your order.</p>' +
      '<div class="vo-actions"><button class="vo-btn good" id="coBtn" type="submit"' + (bad.length ? ' disabled' : '') + '>I have paid. Place order</button><a class="vo-btn alt" href="cart.html">Back to cart</a></div></form>' +
      '<div class="vo-box"><h3>Your order</h3><div class="vo-table-wrap"><table class="vo-table"><tbody>' + L.map(function (l) { return '<tr><td>' + V.esc(l.name) + (l.is_live ? ' <span class="vo-badge vo-blue">Live</span>' : '') + '<br><small>Qty ' + l.qty + ' × ' + (l.unit_price == null ? 'price on request' : V.money(l.unit_price)) + '</small></td><td class="r">' + (l.unit_price == null ? '' : V.money(l.unit_price * l.qty)) + '</td></tr>'; }).join('') + '<tr><td><b>Total</b></td><td class="r"><b>' + V.money(total) + '</b></td></tr></tbody></table></div></div></div>';
    root.innerHTML = h;
    document.getElementById('coCopy').addEventListener('click', function () { try { navigator.clipboard.writeText(upiId); V.toast('UPI ID copied'); } catch (e) { alert(upiId); } });
    document.getElementById('coForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var f = e.target, d = new FormData(f), btn = document.getElementById('coBtn');
      if (!/^[0-9]{10}$/.test(d.get('phone'))) { alert('Enter a valid 10-digit mobile number.'); return; }
      if (!d.get('name').trim() || !d.get('address').trim()) { alert('Please enter your name and address.'); return; }
      var ref = String(d.get('reference') || '').replace(/\s+/g, '').toUpperCase();
      if (!/^[A-Z0-9]{8,30}$/.test(ref)) { alert('Enter the UPI transaction ID / UTR from your payment (8 to 30 letters or numbers).'); return; }
      btn.disabled = true; btn.textContent = 'Placing order…';
      var items = L.map(function (l) { return { slug: l.slug, name: l.name, category: l.category, qty: l.qty, unit_price: l.unit_price, is_live: l.is_live, image: l.image }; });
      var r = await sb.rpc('vp_place_order', { p_customer: { name: d.get('name'), phone: d.get('phone'), email: d.get('email'), address: d.get('address'), city: d.get('city'), pincode: d.get('pincode'), note: d.get('note') }, p_items: items, p_payment_method: 'upi', p_reference: ref });
      if (r.error) { alert(V.msg(r.error)); btn.disabled = false; btn.textContent = 'I have paid. Place order'; return; }
      localStorage.removeItem('cart'); localStorage.removeItem('currentOrder');
      location.href = 'my-orders.html?new=' + encodeURIComponent(r.data.order_no);
    });
  }
  V.requireUser().then(render);
})();
