/* Vimal Pets & Toys: ADMIN PRO. Shared by every admin page (read-only helpers; never writes data).
   Adds: dark/light theme, live clock, alerts bell, Ctrl+K command palette, sidebar badges,
   a live KPI ribbon and (dashboard / payments) order, payment-verification and revenue insights. */
(function () {
  'use strict';
  var KEY = 'vp-admin-theme';
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  document.documentElement.setAttribute('data-ap-theme', store(KEY) === 'dark' ? 'dark' : 'light');

  var PAGES = [
    ['Dashboard', 'admin-dashboard.html', '📊', 'Overview'], ['Orders', 'admin-orders.html', '📦', 'Verify payments, status, tracking'],
    ['Payments', 'admin-payments.html', '💳', 'Payment records'], ['Products', 'admin-products.html', '🛍️', 'Listings'],
    ['Sellers', 'admin-sellers.html', '🏪', 'Registered shops'], ['Seller applications', 'admin-seller-applications.html', '📝', 'Pending approvals'],
    ['Moderation', 'admin-moderation.html', '🛡️', 'Review content'], ['Admin tools', 'admin-tools.html', '⚙️', 'Exports and utilities'],
    ['Security', 'admin-security.html', '🔐', 'Access and roles'], ['View website', 'index.html', '🌐', 'Open the live shop']
  ];
  var ST = { pending_payment: 'Awaiting payment', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', refund_pending: 'Refund pending', refunded: 'Refunded' };
  var file = (location.pathname.split('/').pop() || 'admin-dashboard.html').toLowerCase();
  var isDash = file === 'admin-dashboard.html' || /\bpage-dashboard\b/.test(document.body ? document.body.className : '');
  var D = { orders: [], items: [], reqs: [], svcs: [], events: [], ok: false };

  function client() { try { return typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient; } catch (e) { return window.supabaseClient; } }
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { n = Number(n) || 0; return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
  function ago(d) { var s = (Date.now() - new Date(d).getTime()) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' d ago'; }
  function sameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }

  /* ------------------------------------------------ shell */
  function shell() {
    var side = $('.sidebar .nav');
    if (side && !$('.ap-navlabel')) { var l = document.createElement('div'); l.className = 'ap-navlabel'; l.textContent = 'Workspace'; side.parentNode.insertBefore(l, side); }
    var bot = $('.sidebar-bottom');
    if (bot && !$('.ap-sideinfo')) {
      var i = document.createElement('div'); i.className = 'ap-sideinfo';
      i.innerHTML = '<b>Online payments only</b><br>Orders are confirmed only after the payment is verified in the bank / UPI records.';
      bot.insertBefore(i, bot.firstChild);
    }
    var tb = $('.topbar'), pill = $('.admin-pill');
    if (tb && !$('.ap-tools')) {
      var t = document.createElement('div'); t.className = 'ap-tools';
      t.innerHTML = '<button type="button" class="ap-chip" id="apSearch" aria-label="Open command palette">🔎 <span class="lbl">Search or jump to…</span> <kbd>Ctrl K</kbd></button>' +
        '<div class="ap-chip ap-clock" id="apClock"><span id="apTime">--:--</span><small id="apDate"></small></div>' +
        '<button type="button" class="ap-icon-btn" id="apTheme" aria-label="Toggle dark mode" title="Toggle dark mode">🌓</button>' +
        '<span style="position:relative"><button type="button" class="ap-icon-btn" id="apBell" aria-label="Alerts" title="Alerts">🔔<span class="ap-dot" id="apBellN" hidden>0</span></button><div class="ap-pop" id="apPop"></div></span>';
      tb.insertBefore(t, pill || null);
      var h3 = $('.topbar h3');
      if (h3 && !$('.ap-crumbs')) { var c = document.createElement('span'); c.className = 'ap-crumbs'; c.innerHTML = 'Admin › <b>' + esc((h3.textContent.split('—')[1] || 'Dashboard').trim()) + '</b>'; h3.parentNode.insertBefore(c, h3); }
    }
    function tick() { var n = new Date(), tm = $('#apTime'), dt = $('#apDate'); if (tm) tm.textContent = n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); if (dt) dt.textContent = n.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
    tick(); setInterval(tick, 1000);
    var th = $('#apTheme'); if (th) th.onclick = function () { var d = document.documentElement.getAttribute('data-ap-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-ap-theme', d); store(KEY, d); };
    var bell = $('#apBell'), pop = $('#apPop');
    if (bell) bell.onclick = function (e) { e.stopPropagation(); pop.classList.toggle('open'); };
    document.addEventListener('click', function (e) { if (pop && !pop.contains(e.target)) pop.classList.remove('open'); });
    var sb = $('#apSearch'); if (sb) sb.onclick = openPal;
    var menu = $('#menuBtn'), sbar = $('#sidebar'), ov = $('#overlay');
    if (menu && sbar && !menu.__ap) { menu.__ap = 1; menu.addEventListener('click', function () { sbar.classList.toggle('open'); if (ov) ov.classList.toggle('show'); }); if (ov) ov.addEventListener('click', function () { sbar.classList.remove('open'); ov.classList.remove('show'); }); }
  }

  /* ------------------------------------------------ data */
  async function load() {
    var sb = client(); if (!sb) return;
    async function q(p) { try { var r = await p; return r.error ? [] : (r.data || []); } catch (e) { return []; } }
    var r = await Promise.all([
      q(sb.from('vp_orders').select('id,order_no,customer_name,phone,total,order_status,payment_status,payment_reference,created_at').order('created_at', { ascending: false }).limit(1000)),
      q(sb.from('vp_order_items').select('name,qty,line_total,order_id').limit(3000)),
      q(sb.from('vp_order_requests').select('id,kind,status,order_id,created_at').limit(500)),
      q(sb.from('vp_service_requests').select('id,service,status,name,created_at').limit(300)),
      q(sb.from('vp_order_events').select('order_id,kind,to_value,note,actor,created_at').order('created_at', { ascending: false }).limit(10))
    ]);
    D.orders = r[0]; D.items = r[1]; D.reqs = r[2]; D.svcs = r[3]; D.events = r[4]; D.ok = true;
  }
  function stats() {
    var o = D.orders, today = new Date();
    var verify = o.filter(function (x) { return x.payment_status === 'pending' && x.order_status === 'pending_payment'; });
    var wait = o.filter(function (x) { return x.payment_status === 'unpaid' && x.order_status === 'pending_payment'; });
    var paid = o.filter(function (x) { return x.payment_status === 'paid'; });
    return {
      verify: verify, wait: wait, paid: paid,
      today: o.filter(function (x) { return sameDay(x.created_at, today); }),
      revToday: paid.filter(function (x) { return sameDay(x.created_at, today); }).reduce(function (n, x) { return n + Number(x.total || 0); }, 0),
      revAll: paid.reduce(function (n, x) { return n + Number(x.total || 0); }, 0),
      openReq: D.reqs.filter(function (x) { return x.status === 'open' || x.status === 'in_review'; }).length,
      newSvc: D.svcs.filter(function (x) { return x.status === 'requested'; }).length,
      toShip: o.filter(function (x) { return x.order_status === 'confirmed' || x.order_status === 'processing'; }).length
    };
  }

  /* ------------------------------------------------ sidebar badges + bell */
  function badges(S) {
    function add(el, n, red) { if (!el || !n || el.querySelector('.ap-badge')) return; var b = document.createElement('span'); b.className = 'ap-badge' + (red ? ' red' : ''); b.textContent = n; el.appendChild(b); }
    document.querySelectorAll('.nav a, .nav button').forEach(function (el) {
      var h = (el.getAttribute('href') || '') + ' ' + (el.getAttribute('data-target') || '') + ' ' + el.textContent;
      if (/admin-orders|Order Management/i.test(h)) add(el, S.verify.length, true);
      else if (/admin-payments|payments/i.test(h)) add(el, S.verify.length, true);
    });
    var items = [], bellN = S.verify.length + S.openReq + S.newSvc;
    if (S.verify.length) items.push(['admin-orders.html', '💳', S.verify.length + ' payment' + (S.verify.length > 1 ? 's' : '') + ' to verify', 'Customers sent a transaction ID']);
    if (S.wait.length) items.push(['admin-orders.html', '⏳', S.wait.length + ' awaiting payment', 'No transaction ID yet']);
    if (S.openReq) items.push(['admin-orders.html', '💬', S.openReq + ' open customer request' + (S.openReq > 1 ? 's' : ''), 'Cancellations, issues, support']);
    if (S.newSvc) items.push(['admin-orders.html', '🛠️', S.newSvc + ' new service request' + (S.newSvc > 1 ? 's' : ''), 'Aquarium setup and maintenance']);
    if (S.toShip) items.push(['admin-orders.html', '📦', S.toShip + ' order' + (S.toShip > 1 ? 's' : '') + ' to prepare', 'Paid and confirmed']);
    var n = $('#apBellN'); if (n) { n.hidden = !bellN; n.textContent = bellN; }
    var pop = $('#apPop'); if (pop) pop.innerHTML = '<h5>Needs your attention</h5>' + (items.length ? items.map(function (i) { return '<a href="' + i[0] + '"><span class="ap-ico">' + i[1] + '</span><span><b>' + esc(i[2]) + '</b><small>' + esc(i[3]) + '</small></span></a>'; }).join('') : '<div class="ap-empty">All clear. Nothing is waiting.</div>');
  }

  /* ------------------------------------------------ ribbon + insights */
  function kpi(cls, ico, val, label, sub, href) { return '<a class="ap-card ap-kpi ' + cls + '" href="' + href + '"><span class="ico">' + ico + '</span><div><span>' + label + '</span><b>' + val + '</b><small>' + sub + '</small></div></a>'; }
  function ribbon(S) {
    if (file === 'admin-orders.html') return;
    var host = $('.container'); if (!host || $('#apRibbon')) return;
    var d = document.createElement('div'); d.id = 'apRibbon'; d.className = 'ap-ribbon';
    d.innerHTML = kpi((S.verify.length ? 'warn pulse' : 'good'), '💳', S.verify.length, 'Payments to verify', S.verify.length ? 'Check bank / UPI now' : 'Nothing pending', 'admin-orders.html') +
      kpi('', '🧾', S.today.length, 'Orders today', inr(S.today.reduce(function (n, x) { return n + Number(x.total || 0); }, 0)) + ' placed', 'admin-orders.html') +
      kpi('good', '💰', inr(S.revToday), 'Verified revenue today', 'All time: ' + inr(S.revAll), 'admin-payments.html') +
      kpi(S.openReq ? 'bad' : '', '💬', S.openReq, 'Open requests', S.newSvc + ' new service request(s)', 'admin-orders.html');
    var anchor = $('.page-intro', host) || $('.welcome', host); if (anchor) anchor.after(d); else host.prepend(d);
  }
  function insights(S) {
    var sec = $('.container'); if (!sec || $('#apInsights')) return;
    var o = D.orders, pay = file === 'admin-payments.html';
    var order = ['pending_payment', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refund_pending'];
    var max = Math.max.apply(null, [1].concat(order.map(function (k) { return o.filter(function (x) { return x.order_status === k; }).length; })));
    var pipe = order.map(function (k) { var c = o.filter(function (x) { return x.order_status === k; }).length; return '<div class="ap-pipe-row"><span>' + ST[k] + '</span><div class="ap-bar"><i class="' + (k === 'cancelled' || k === 'refund_pending' ? 'red' : k === 'delivered' ? 'green' : k === 'pending_payment' ? 'gold' : '') + '" style="width:' + Math.round(c / max * 100) + '%"></i></div><b>' + c + '</b></div>'; }).join('');
    var days = [], mx = 1; for (var i = 13; i >= 0; i--) { var dd = new Date(); dd.setDate(dd.getDate() - i); var v = S.paid.filter(function (x) { return sameDay(x.created_at, dd); }).reduce(function (n, x) { return n + Number(x.total || 0); }, 0); mx = Math.max(mx, v); days.push([dd, v]); }
    var spark = '<div class="ap-spark">' + days.map(function (x) { return '<div><i data-v="' + inr(x[1]) + '" style="height:' + Math.max(2, Math.round(x[1] / mx * 100)) + '%"></i>' + x[0].getDate() + '</div>'; }).join('') + '</div>';
    var queue = S.verify.slice(0, 6).map(function (x) { return '<div class="ap-row"><div class="t"><b>' + esc(x.order_no) + ' · ' + inr(x.total) + '</b><small>' + esc(x.customer_name) + ' · ID ' + esc(x.payment_reference || 'n/a') + ' · ' + ago(x.created_at) + '</small></div><a class="ap-btn" href="admin-orders.html#' + encodeURIComponent(x.order_no) + '">Verify</a></div>'; }).join('') || '<div class="ap-empty">🎉 No payments waiting for verification.</div>';
    var recent = o.slice(0, 7).map(function (x) { return '<div class="ap-row"><div class="t"><b>' + esc(x.order_no) + ' · ' + esc(x.customer_name) + '</b><small>' + ago(x.created_at) + ' · ' + esc(ST[x.order_status] || x.order_status) + '</small></div><div style="text-align:right"><b>' + inr(x.total) + '</b><br><span class="ap-pill ' + (x.payment_status === 'paid' ? 'green' : x.payment_status === 'failed' ? 'red' : 'gold') + '">' + (x.payment_status === 'paid' ? 'Paid' : x.payment_status === 'pending' ? 'Verifying' : esc(x.payment_status.replace('_', ' '))) + '</span></div></div>'; }).join('') || '<div class="ap-empty">No orders yet.</div>';
    var tally = {}; D.items.forEach(function (it) { var t = tally[it.name] = tally[it.name] || { q: 0, v: 0 }; t.q += it.qty; t.v += Number(it.line_total || 0); });
    var top = Object.keys(tally).sort(function (a, b) { return tally[b].v - tally[a].v; }).slice(0, 5);
    var topH = top.map(function (n, i) { return '<div class="ap-row"><div class="t"><b>' + (i + 1) + '. ' + esc(n) + '</b><small>' + tally[n].q + ' sold</small></div><b>' + inr(tally[n].v) + '</b></div>'; }).join('') || '<div class="ap-empty">Sales will appear here.</div>';
    var act = D.events.map(function (e) { return '<div>' + esc(e.kind === 'status' ? 'Order moved to ' + (ST[e.to_value] || e.to_value) : e.note || e.kind) + '<small>' + esc(e.actor) + ' · ' + ago(e.created_at) + '</small></div>'; }).join('') || '<div class="ap-empty">No activity yet.</div>';
    var html = '<div id="apInsights" class="ap-grid">' +
      '<div class="ap-card ap-c5"><h4>Payment verification queue <a href="admin-orders.html">Open orders →</a></h4><div class="ap-list">' + queue + '</div></div>' +
      '<div class="ap-card ap-c7"><h4>Verified revenue, last 14 days <span class="ap-pill gold">' + inr(S.paid.length ? days.reduce(function (n, x) { return n + x[1]; }, 0) : 0) + '</span></h4>' + spark + '</div>' +
      (pay ? '' : '<div class="ap-card ap-c4"><h4>Order pipeline</h4><div class="ap-pipe">' + pipe + '</div></div>' +
      '<div class="ap-card ap-c4"><h4>Recent orders <a href="admin-orders.html">All →</a></h4><div class="ap-list">' + recent + '</div></div>' +
      '<div class="ap-card ap-c4"><h4>Top products</h4><div class="ap-list">' + topH + '</div><h4 style="margin-top:18px">Live activity</h4><div class="ap-tl">' + act + '</div></div>') + '</div>';
    var rb = $('#apRibbon'); var holder = document.createElement('div'); holder.innerHTML = html;
    if (rb) rb.after(holder.firstChild); else sec.prepend(holder.firstChild);
  }

  /* ------------------------------------------------ command palette */
  var pal, sc, input, list, sel = 0, cur = [];
  function buildPal() {
    sc = document.createElement('div'); sc.className = 'ap-scrim'; sc.onclick = closePal;
    pal = document.createElement('div'); pal.className = 'ap-pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-label', 'Command palette');
    pal.innerHTML = '<input id="apPalIn" placeholder="Jump to a page, or search an order by number, name or phone…" autocomplete="off"><ul id="apPalList"></ul><footer><span>↑↓ move</span><span>Enter open</span><span>Esc close</span></footer>';
    document.body.appendChild(sc); document.body.appendChild(pal); input = $('#apPalIn'); list = $('#apPalList');
    input.addEventListener('input', paint); input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, cur.length - 1); mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); mark(); e.preventDefault(); }
      else if (e.key === 'Enter' && cur[sel]) go(cur[sel]);
    });
  }
  function paint() {
    var q = input.value.trim().toLowerCase(); sel = 0;
    var pages = PAGES.filter(function (p) { return !q || (p[0] + ' ' + p[3]).toLowerCase().indexOf(q) >= 0; }).map(function (p) { return { t: p[2] + '  ' + p[0], s: p[3], u: p[1] }; });
    var ords = q.length < 2 ? [] : D.orders.filter(function (x) { return (x.order_no + ' ' + x.customer_name + ' ' + x.phone + ' ' + (x.payment_reference || '')).toLowerCase().indexOf(q) >= 0; }).slice(0, 8).map(function (x) { return { t: '🧾  ' + x.order_no + ' · ' + x.customer_name, s: inr(x.total) + ' · ' + (ST[x.order_status] || x.order_status), u: 'admin-orders.html#' + encodeURIComponent(x.order_no) }; });
    cur = ords.concat(pages);
    list.innerHTML = cur.length ? cur.map(function (c, i) { return '<li data-i="' + i + '" class="' + (i === 0 ? 'on' : '') + '"><span>' + esc(c.t) + '</span><small>' + esc(c.s) + '</small></li>'; }).join('') : '<li><span>No matches</span></li>';
    list.querySelectorAll('li[data-i]').forEach(function (li) { li.onclick = function () { go(cur[+li.getAttribute('data-i')]); }; });
  }
  function mark() { list.querySelectorAll('li').forEach(function (li, i) { li.classList.toggle('on', i === sel); if (i === sel) li.scrollIntoView({ block: 'nearest' }); }); }
  function go(c) { location.href = c.u; }
  function openPal() { if (!pal) buildPal(); sc.classList.add('open'); pal.classList.add('open'); input.value = ''; paint(); input.focus(); }
  function closePal() { if (pal) { pal.classList.remove('open'); sc.classList.remove('open'); } }
  document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); } else if (e.key === 'Escape') closePal(); });

  /* ------------------------------------------------ table helpers: density + CSV on any admin table */
  function tableTools() {
    document.querySelectorAll('.section .toolbar').forEach(function (tb) {
      if (tb.__ap) return; tb.__ap = 1;
      var wrap = tb.parentNode.querySelector('.table-wrap'); if (!wrap) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'refresh'; b.textContent = '↕ Compact rows';
      b.onclick = function () { wrap.classList.toggle('ap-dense'); b.textContent = wrap.classList.contains('ap-dense') ? '↕ Comfortable rows' : '↕ Compact rows'; };
      tb.appendChild(b);
    });
  }

  /* ------------------------------------------------ boot */
  function boot() {
    shell(); tableTools(); setInterval(tableTools, 2500);
    var tries = 0;
    (async function go() {
      if (!client() && tries++ < 20) return setTimeout(go, 300);
      await load(); if (!D.ok) return;
      var S = stats(); badges(S);
      var run = function () { ribbon(S); if (isDash || file === 'admin-payments.html') insights(S); };
      /* these pages only show content once the admin check passes: wait for it */
      if (document.body.classList.contains('auth-verified') || file === 'admin-orders.html' || file === 'admin-dashboard.html') run();
      else { var n = 0, t = setInterval(function () { if (document.body.classList.contains('auth-verified') || ++n > 40) { clearInterval(t); run(); } }, 400); }
      setInterval(async function () { await load(); badges(stats()); }, 60000);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
