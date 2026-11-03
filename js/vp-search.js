/* Vimal Pets & Toys: site search (Amazon / Flipkart style).
   - live suggestions while you type, matching every letter (word starts, middle of words, category, keywords, small typos)
   - works with every search box on the site, on phone, tablet and desktop
   - full results page (search-results.html) with category chips, sort, price filter and Add to Cart
   Needs: js/search-index.js (made by tools/build-search-index.js). Load LAST on every page. */
(function () {
  'use strict';
  if (window.VPS && window.VPS._ready) return;

  var INPUTS = '#searchInput, #vrSearchInput, #resultsInput, .search-box input[type="search"], .search-box input[type="text"]';
  var WHATSAPP = (window.VPW_CONFIG && window.VPW_CONFIG.whatsapp) || '917845452727';
  var RECENT_KEY = 'vp_recent_searches';
  var POPULAR = [['Dogs', '🐶'], ['Cats', '🐱'], ['Fish', '🐠'], ['Birds', '🦜'], ['Aquariums', '🐟'], ['Accessories', '🎯'], ['Pet Foods', '🍖'], ['Toys', '🧸']];
  var SYN = { puppy: 'dog', puppies: 'dog', dogs: 'dog', kitten: 'cat', kittens: 'cat', cats: 'cat', parrot: 'bird', parrots: 'bird', birds: 'bird', tank: 'aquarium', aquariums: 'aquarium', food: 'foods', toy: 'toys', goldfish: 'gold fish', rabbit: 'small pets', hamster: 'small pets' };

  /* ---------- css ---------- */
  var CSS = '' +
    '#v27-search-suggestions,.vp-search-suggestions,#searchSuggestions{display:none!important}' +
    '.vps-box{position:fixed;z-index:100002;background:#fff;color:#122033;border:1px solid #dbe4ee;border-radius:14px;box-shadow:0 18px 50px rgba(8,20,45,.3);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;display:none;font-family:Poppins,Arial,sans-serif;text-align:left}' +
    '.vps-box.show{display:block}' +
    '.vps-head{padding:10px 14px 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7b8aa3;font-weight:700}' +
    '.vps-row{display:flex;align-items:center;gap:12px;padding:8px 14px;min-height:56px;text-decoration:none;color:inherit;cursor:pointer;box-sizing:border-box;-webkit-tap-highlight-color:transparent}' +
    '.vps-row:hover,.vps-row.active{background:#eaf6fb}' +
    '.vps-img{width:44px;height:44px;border-radius:9px;object-fit:cover;background:#f1f5f9;flex:none}' +
    '.vps-ico{width:44px;height:44px;border-radius:9px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none}' +
    '.vps-main{min-width:0;flex:1}' +
    '.vps-name{font-size:14px;font-weight:500;line-height:1.3;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.vps-name b{font-weight:800;color:#0a1a3a}' +
    '.vps-meta{font-size:12px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.vps-price{margin-left:auto;font-weight:700;font-size:13px;white-space:nowrap;color:#0a1a3a;padding-left:6px}' +
    '.vps-all{justify-content:center;border-top:1px solid #e8eef5;font-weight:700;color:#0077b6;font-size:14px;min-height:50px}' +
    '.vps-none{padding:18px 16px;font-size:14px;color:#475569;line-height:1.5}' +
    '.vps-chips{display:flex;flex-wrap:wrap;gap:8px;padding:6px 14px 14px}' +
    '.vps-chip{border:1px solid #cfe3ee;background:#f4fafd;color:#0a1a3a;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer}' +
    '.vps-chip:hover{background:#dff3fb}' +
    '@media(max-width:768px){.vps-box{border-radius:12px}.vps-row{min-height:60px;padding:8px 12px}.vps-name{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.search-box input,#searchInput,#vrSearchInput{font-size:16px!important}}' +
    /* results page */
    '.vpr{max-width:1240px;margin:0 auto;padding:18px 14px 50px;font-family:Poppins,Arial,sans-serif}' +
    '.vpr-hero{text-align:center;color:#fff;padding:26px 8px 12px}' +
    '.vpr-hero h1{margin:0 0 6px;font-size:clamp(22px,4.6vw,34px);color:#fff;overflow-wrap:anywhere}' +
    '.vpr-hero p{margin:0 auto 14px;color:#cfe6f3;font-size:14px;max-width:640px}' +
    '.vpr-form{display:flex;max-width:640px;margin:0 auto;background:#fff;border-radius:999px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.25)}' +
    '.vpr-form input{flex:1;min-width:0;border:0;outline:0;padding:13px 18px;font-size:16px;background:transparent;color:#122033}' +
    '.vpr-form button{border:0;background:#00b4d8;color:#fff;font-weight:700;padding:0 22px;font-size:15px;cursor:pointer}' +
    '.vpr-bar{background:#fff;color:#122033;border-radius:14px;padding:12px 14px;margin:16px 0 14px;box-shadow:0 6px 22px rgba(0,0,0,.18)}' +
    '.vpr-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}' +
    '.vpr-count{font-size:14px;color:#334155}.vpr-count b{color:#0a1a3a}' +
    '.vpr-sel{display:flex;gap:8px;flex-wrap:wrap}' +
    '.vpr-sel select{border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;font-size:14px;background:#fff;color:#122033;max-width:100%}' +
    '.vpr-chips{display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}' +
    '.vpr-chip{flex:none;border:1px solid #cfe3ee;background:#f4fafd;color:#0a1a3a;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}' +
    '.vpr-chip.on{background:#0a1a3a;color:#fff;border-color:#0a1a3a}' +
    '.vpr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}' +
    '.vpr-card{background:#fff;color:#122033;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 20px rgba(0,0,0,.16);text-decoration:none;position:relative;min-width:0}' +
    '.vpr-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.25)}' +
    '.vpr-imgw{aspect-ratio:4/3;background:#f1f5f9;overflow:hidden}' +
    '.vpr-imgw img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.vpr-body{padding:11px 12px 12px;display:flex;flex-direction:column;gap:5px;flex:1}' +
    '.vpr-cat{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#64748b;font-weight:600}' +
    '.vpr-name{font-size:15px;font-weight:600;line-height:1.3;color:#0a1a3a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}' +
    '.vpr-name b{background:#fff3b0;font-weight:700}' +
    '.vpr-price{font-size:18px;font-weight:800;color:#0a1a3a;margin-top:auto}' +
    '.vpr-price.req{font-size:14px;font-weight:700;color:#7a5200}' +
    '.vpr-st{font-size:12px;font-weight:700}.vpr-st.in{color:#0b6b3a}.vpr-st.out{color:#a31616}.vpr-st.contact{color:#7a5200}' +
    '.vpr-btn{margin-top:6px;display:block;text-align:center;border:2px solid #00b4d8;background:#fff;color:#007a96;font-weight:700;font-size:14px;padding:9px 8px;border-radius:10px;cursor:pointer;text-decoration:none;font-family:inherit}' +
    '.vpr-btn.cart{background:#00b4d8;color:#fff}.vpr-btn:disabled{opacity:.55;cursor:not-allowed}' +
    '.vpr-more{display:block;margin:22px auto 0;border:0;background:#00b4d8;color:#fff;font-weight:700;padding:12px 30px;border-radius:999px;font-size:15px;cursor:pointer}' +
    '.vpr-empty{background:#fff;color:#334155;border-radius:14px;padding:26px 18px;text-align:center;line-height:1.6}' +
    '.vpr-empty h2{margin:0 0 6px;color:#0a1a3a;font-size:20px}' +
    '.vpr-empty .vps-chips{justify-content:center;padding:10px 0 0}' +
    '@media(max-width:768px){.vpr{padding:12px 10px 40px}.vpr-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.vpr-name{font-size:13.5px}.vpr-price{font-size:16px}.vpr-body{padding:9px 9px 10px}.vpr-btn{font-size:13px;padding:8px 4px}.vpr-top{flex-direction:column;align-items:stretch}.vpr-sel select{flex:1}.vpr-form button{padding:0 16px}}' +
    '@media(max-width:340px){.vpr-grid{grid-template-columns:1fr}}';
  var st = document.createElement('style'); st.setAttribute('data-vps', '1'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/&amp;/g, '&'); }
  function words(s) { return norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean); }
  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  function toks(q) { return words(q); }
  function within1(a, b) {
    if (a === b) return true; var la = a.length, lb = b.length; if (Math.abs(la - lb) > 1) return false;
    var i = 0, j = 0, d = 0;
    while (i < la && j < lb) { if (a[i] === b[j]) { i++; j++; continue; } if (++d > 1) return false; if (la > lb) i++; else if (lb > la) j++; else { i++; j++; } }
    return d + (la - i) + (lb - j) <= 1;
  }
  function recent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter(Boolean).slice(0, 5); } catch (e) { return []; } }
  function saveRecent(q) { try { var r = recent().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); }); r.unshift(q); localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 8))); } catch (e) {} }
  function resultsUrl(q, cat) { var p = []; if (q) p.push('q=' + encodeURIComponent(q)); if (cat) p.push('category=' + encodeURIComponent(cat)); return 'search-results.html' + (p.length ? '?' + p.join('&') : ''); }

  /* ---------- index ---------- */
  var DATA = null, loading = null, waiters = [];
  function prepare() {
    DATA = (window.VP_SEARCH_INDEX || []).map(function (it) {
      var o = { n: it.n, c: it.c, u: it.u, i: it.i, p: it.p, s: it.s, l: it.l, _n: norm(it.n), _w: words(it.n), _c: norm(it.c), _cw: words(it.c), _k: norm(it.k) };
      o._ns = o._w.join(''); o._pw = []; for (var i = 0; i < o._w.length - 1; i++) o._pw.push(o._w[i] + o._w[i + 1]);
      return o;
    });
    refreshLive();
  }
  /* prices and stock from the live catalogue, when the page has loaded it */
  function refreshLive() {
    if (!DATA || !window.VPW || !window.VPW.getProduct) return;
    DATA.forEach(function (o) {
      if (!o.l) return; var m = /id=([^&]+)/.exec(o.u); if (!m) return;
      var rec = window.VPW.getProduct(decodeURIComponent(m[1])); if (!rec) return;
      o.p = rec.price == null ? null : rec.price; o.s = rec._state === 'in_stock' ? 'in' : rec._state === 'out_of_stock' ? 'out' : 'contact';
    });
  }
  function load(cb) {
    if (DATA) { cb && cb(); return; }
    if (cb) waiters.push(cb);
    if (loading) return; loading = true;
    function done() { prepare(); var w = waiters.slice(); waiters = []; w.forEach(function (f) { f(); }); }
    if (window.VP_SEARCH_INDEX) { done(); return; }
    var s = document.createElement('script'); s.src = 'js/search-index.js?v=1'; s.onload = done; s.onerror = function () { window.VP_SEARCH_INDEX = []; done(); };
    document.head.appendChild(s);
  }

  /* ---------- matching ---------- */
  function scoreToken(it, t, fuzzy) {
    var best = 0, alts = [t];
    if (SYN[t]) alts.push(SYN[t]);
    alts.forEach(function (a, idx) {
      var pen = idx ? 1 : 0, s = 0, parts = a.split(' ');
      if (parts.length > 1) { var sum = 0; for (var q = 0; q < parts.length; q++) { var r = scoreToken(it, parts[q], false); if (!r) { sum = 0; break; } sum += r; } s = sum / parts.length; }
      else {
        if (it._w.indexOf(a) >= 0) s = 12;
        else if (it._w.some(function (w) { return w.indexOf(a) === 0; })) s = 10;
        else if (it._n.indexOf(a) >= 0) s = 6;
        else if (a.length >= 3 && it._ns.indexOf(a) >= 0) s = 5;
        else if (it._cw.some(function (w) { return w.indexOf(a) === 0; })) s = 4;
        else if (it._c.indexOf(a) >= 0) s = 3;
        else if (it._k.indexOf(a) >= 0) s = 3;
        else if (fuzzy && a.length >= 4 && it._w.concat(it._pw).some(function (w) { return within1(w.slice(0, a.length), a) || within1(w, a); })) s = 2;
      }
      s = s ? s - pen * 0.5 : 0; if (s > best) best = s;
    });
    return best;
  }
  function search(q, opts) {
    opts = opts || {}; var T = toks(q); if (!DATA) return [];
    var cat = opts.category ? norm(opts.category) : '';
    var pool = cat ? DATA.filter(function (it) { return it._c === cat; }) : DATA;
    if (!T.length) return pool.slice().sort(function (a, b) { return a._n < b._n ? -1 : 1; });
    function run(fuzzy) {
      var out = [], qn = norm(q).trim();
      pool.forEach(function (it) {
        var sum = 0;
        for (var k = 0; k < T.length; k++) { var s = scoreToken(it, T[k], fuzzy); if (!s) return; sum += s; }
        if (it._n === qn) sum += 30; else if (it._n.indexOf(qn) === 0) sum += 15; else if (it._n.indexOf(qn) > 0) sum += 5;
        if (it.l) sum += 1; if (it.s === 'in') sum += 0.5;
        out.push({ it: it, sc: sum });
      });
      out.sort(function (a, b) { return b.sc - a.sc || (a.it._n < b.it._n ? -1 : 1); });
      return out.map(function (x) { return x.it; });
    }
    var r = run(false); if (!r.length) { r = run(true); r.fuzzy = true; } return r;
  }
  function categories(list) { var m = {}, order = []; list.forEach(function (it) { if (!m[it.c]) { m[it.c] = 0; order.push(it.c); } m[it.c]++; }); return order.map(function (c) { return [c, m[c]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  function hi(name, T) {
    var low = name.toLowerCase(), marks = [];
    T.forEach(function (t) { var i = low.indexOf(t); if (i >= 0) marks.push([i, i + t.length]); });
    if (!marks.length) return esc(name);
    marks.sort(function (a, b) { return a[0] - b[0]; }); var m = [marks[0]];
    for (var i = 1; i < marks.length; i++) { var l = m[m.length - 1]; if (marks[i][0] <= l[1]) l[1] = Math.max(l[1], marks[i][1]); else m.push(marks[i]); }
    var out = '', pos = 0; m.forEach(function (r) { out += esc(name.slice(pos, r[0])) + '<b>' + esc(name.slice(r[0], r[1])) + '</b>'; pos = r[1]; });
    return out + esc(name.slice(pos));
  }

  /* ---------- suggestion box ---------- */
  var box = null, cur = null, activeIdx = -1, lastQ = '';
  function ensureBox() { if (box) return box; box = document.createElement('div'); box.className = 'vps-box'; box.setAttribute('role', 'listbox'); box.id = 'vpsBox'; document.body.appendChild(box); box.addEventListener('mousedown', function (e) { e.preventDefault(); }); box.addEventListener('touchstart', function () { if (cur && document.activeElement === cur && window.innerWidth <= 768) { /* keep keyboard; scroll the list */ } }, { passive: true }); return box; }
  function place() {
    if (!box || !cur) return; var r = cur.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    var mobile = vw <= 768, left, width;
    if (mobile) { left = 8; width = vw - 16; } else { width = Math.min(Math.max(r.width, 420), vw - 16); left = Math.min(Math.max(8, r.left), vw - width - 8); }
    var top = r.bottom + 8; box.style.left = left + 'px'; box.style.width = width + 'px'; box.style.top = top + 'px';
    var vv = window.visualViewport, avail = (vv ? vv.height : vh) - top - 10; box.style.maxHeight = Math.max(160, avail) + 'px';
  }
  function hide() { if (box) { box.classList.remove('show'); box.innerHTML = ''; } activeIdx = -1; }
  function rows() { return box ? Array.prototype.slice.call(box.querySelectorAll('.vps-row')) : []; }
  function setActive(i) { var rs = rows(); if (!rs.length) return; activeIdx = (i + rs.length) % rs.length; rs.forEach(function (r, k) { r.classList.toggle('active', k === activeIdx); }); rs[activeIdx].scrollIntoView({ block: 'nearest' }); }
  function rowItem(it, T) {
    var img = it.i ? '<img class="vps-img" src="' + esc(it.i) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'images/vimallogo.png\'">' : '<span class="vps-ico">🛍</span>';
    return '<a class="vps-row" role="option" href="' + esc(it.u) + '" data-go="' + esc(it.u) + '">' + img + '<span class="vps-main"><span class="vps-name" style="display:block">' + hi(it.n, T) + '</span><span class="vps-meta" style="display:block">in ' + esc(it.c) + '</span></span><span class="vps-price">' + (it.p != null ? inr(it.p) : '') + '</span></a>';
  }
  function render(q) {
    ensureBox(); q = String(q || ''); lastQ = q; var T = toks(q), html = '';
    if (!T.length) {
      var rc = recent();
      if (rc.length) html += '<div class="vps-head">Recent searches</div>' + rc.map(function (x) { return '<a class="vps-row" role="option" href="' + esc(resultsUrl(x)) + '" data-q="' + esc(x) + '"><span class="vps-ico">🕘</span><span class="vps-main"><span class="vps-name" style="display:block">' + esc(x) + '</span></span></a>'; }).join('');
      html += '<div class="vps-head">Popular</div><div class="vps-chips">' + POPULAR.map(function (p) { return '<a class="vps-chip vps-row-chip" href="' + esc(resultsUrl(p[0])) + '" data-q="' + esc(p[0]) + '">' + p[1] + ' ' + esc(p[0]) + '</a>'; }).join('') + '</div>';
    } else if (!DATA) {
      html = '<div class="vps-none">Searching…</div>'; load(function () { if (cur && cur.value === q && box.classList.contains('show')) render(q); });
    } else {
      var res = search(q), cats = categories(res);
      if (!res.length) {
        html = '<div class="vps-none">No match for <b>“' + esc(q) + '”</b>. Check the spelling or try a shorter word.</div><div class="vps-chips">' + POPULAR.map(function (p) { return '<a class="vps-chip vps-row-chip" href="' + esc(resultsUrl(p[0])) + '" data-q="' + esc(p[0]) + '">' + p[1] + ' ' + esc(p[0]) + '</a>'; }).join('') + '</div>';
      } else {
        if (res.fuzzy) html += '<div class="vps-head">Did you mean</div>';
        /* category shortcuts: only when the typed word is the start of a category name */
        var qn = norm(q).trim(), cs = cats.filter(function (c) { return norm(c[0]).indexOf(qn) === 0 || norm(c[0]).split(/\s+/).some(function (w) { return qn.length >= 2 && w.indexOf(qn) === 0; }); }).slice(0, 2);
        cs.forEach(function (c) { html += '<a class="vps-row" role="option" href="' + esc(resultsUrl('', c[0])) + '" data-cat="' + esc(c[0]) + '"><span class="vps-ico">🗂</span><span class="vps-main"><span class="vps-name" style="display:block">Browse <b>' + esc(c[0]) + '</b></span><span class="vps-meta" style="display:block">' + c[1] + ' item' + (c[1] > 1 ? 's' : '') + '</span></span></a>'; });
        html += res.slice(0, window.innerWidth <= 768 ? 6 : 8).map(function (it) { return rowItem(it, T); }).join('');
        html += '<a class="vps-row vps-all" role="option" href="' + esc(resultsUrl(q)) + '" data-q="' + esc(q) + '">See all ' + res.length + ' result' + (res.length > 1 ? 's' : '') + ' for “' + esc(q) + '”</a>';
      }
    }
    box.innerHTML = html; place(); box.classList.add('show'); activeIdx = -1;
  }

  /* ---------- go ---------- */
  function go(q, cat) {
    q = String(q || '').trim();
    if (!q && !cat) { if (cur) cur.focus(); return; }
    if (q) saveRecent(q); hide();
    if (window.VPS_PAGE) { window.VPS_PAGE.show(q, cat, true); return; }
    location.href = resultsUrl(q, cat);
  }
  function fromInput() { var i = cur || document.getElementById('searchInput') || document.querySelector(INPUTS); go(i ? i.value : ''); }
  window.searchWebsite = window.searchProducts = window.vimalSearchWebsite = function (e) { if (e && e.preventDefault) e.preventDefault(); fromInput(); };

  /* ---------- events (capture on document so they run before the older search code) ---------- */
  function isInput(el) { return el && el.matches && el.matches(INPUTS); }
  document.addEventListener('focusin', function (e) {
    if (!isInput(e.target)) return; cur = e.target; if (e.target.id === 'resultsInput') return;
    e.stopImmediatePropagation(); load(); render(cur.value);
  }, true);
  document.addEventListener('input', function (e) {
    if (!isInput(e.target)) return; cur = e.target; e.stopImmediatePropagation();
    if (e.target.id === 'resultsInput') { if (window.VPS_PAGE) window.VPS_PAGE.live(cur.value); return; }
    render(cur.value);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!isInput(e.target)) return; cur = e.target; var open = box && box.classList.contains('show');
    if (e.key === 'ArrowDown' && open) { e.preventDefault(); e.stopImmediatePropagation(); setActive(activeIdx + 1); }
    else if (e.key === 'ArrowUp' && open) { e.preventDefault(); e.stopImmediatePropagation(); setActive(activeIdx - 1); }
    else if (e.key === 'Escape') { e.stopImmediatePropagation(); hide(); }
    else if (e.key === 'Enter') {
      e.preventDefault(); e.stopImmediatePropagation(); var rs = rows();
      if (open && activeIdx >= 0 && rs[activeIdx]) { var r = rs[activeIdx]; if (r.dataset.cat) go('', r.dataset.cat); else if (r.dataset.q) go(r.dataset.q); else location.href = r.dataset.go; }
      else go(cur.value);
    }
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.querySelector) return; var i = f.querySelector(INPUTS); if (!i) return;
    e.preventDefault(); e.stopImmediatePropagation(); cur = i; go(i.value);
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('.search-box button'); if (b) { e.preventDefault(); e.stopImmediatePropagation(); var f = b.closest('.search-box'); cur = f.querySelector('input') || cur; go(cur ? cur.value : ''); return; }
    var row = t.closest('.vps-box .vps-row, .vps-box .vps-chip');
    if (row) { e.preventDefault(); if (row.dataset.cat) go('', row.dataset.cat); else if (row.dataset.q) go(row.dataset.q); else { saveRecent(lastQ); location.href = row.dataset.go; } return; }
    if (box && box.classList.contains('show') && !t.closest(INPUTS)) hide();
  }, true);
  window.addEventListener('resize', place); window.addEventListener('scroll', function () { if (box && box.classList.contains('show')) place(); }, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', place);

  /* ---------- results page ---------- */
  function initPage() {
    var root = document.getElementById('vpResults'); if (!root) return;
    var S = { q: '', cat: '', sort: 'rel', price: '', shown: 24 }, base = [], list = [];
    var qs = new URLSearchParams(location.search); S.q = (qs.get('q') || '').trim(); S.cat = (qs.get('category') || '').trim();
    var input = document.getElementById('resultsInput'); if (input) input.value = S.q;
    function wa(it) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hi Vimal Pets & Toys, I would like to ' + (it.p == null ? 'know the price of ' : 'confirm availability of ') + it.n + '. ' + location.origin + '/' + it.u); }
    function priceOk(it) {
      if (!S.price) return true; if (it.p == null) return false; var v = S.price;
      return v === 'u500' ? it.p < 500 : v === '500-2000' ? it.p >= 500 && it.p <= 2000 : v === '2000-10000' ? it.p > 2000 && it.p <= 10000 : v === 'o10000' ? it.p > 10000 : true;
    }
    function compute() {
      base = search(S.q, {}); list = base.filter(function (it) { return (!S.cat || norm(it.c) === norm(S.cat)) && priceOk(it); });
      if (S.sort === 'lh') list = list.slice().sort(function (a, b) { return (a.p == null) - (b.p == null) || a.p - b.p; });
      else if (S.sort === 'hl') list = list.slice().sort(function (a, b) { return (a.p == null) - (b.p == null) || b.p - a.p; });
      else if (S.sort === 'az') list = list.slice().sort(function (a, b) { return a._n < b._n ? -1 : 1; });
    }
    function card(it, T) {
      var btn;
      if (it.s === 'out') btn = '<button class="vpr-btn" type="button" disabled>Out of Stock</button>';
      else if (it.p != null && it.s === 'in') btn = '<button class="vpr-btn cart" type="button" data-add="' + esc(it.n) + '" data-price="' + it.p + '" data-img="' + esc(it.i) + '">Add to Cart</button>';
      else btn = '<a class="vpr-btn" href="' + esc(wa(it)) + '" target="_blank" rel="noopener">' + (it.p == null ? 'Contact for Price' : 'Enquire Now') + '</a>';
      var stx = it.s === 'in' ? '<span class="vpr-st in">In Stock</span>' : it.s === 'out' ? '<span class="vpr-st out">Out of Stock</span>' : '<span class="vpr-st contact">Contact to confirm</span>';
      return '<div class="vpr-card"><a href="' + esc(it.u) + '" class="vpr-imgw" aria-label="' + esc(it.n) + '" style="display:block"><img src="' + esc(it.i || 'images/vimallogo.png') + '" alt="' + esc(it.n) + '" loading="lazy" onerror="this.onerror=null;this.src=\'images/vimallogo.png\'"></a><div class="vpr-body"><span class="vpr-cat">' + esc(it.c) + '</span><a href="' + esc(it.u) + '" class="vpr-name" style="text-decoration:none">' + hi(it.n, T) + '</a>' + stx + '<div class="vpr-price' + (it.p == null ? ' req' : '') + '">' + (it.p != null ? inr(it.p) : 'Price on request') + '</div>' + btn + '</div></div>';
    }
    function draw() {
      compute(); var T = toks(S.q), cats = categories(base);
      var title = S.q ? 'Results for “' + S.q + '”' : (S.cat ? S.cat : 'Shop all products'); var h = document.getElementById('resultsTitle'); if (h) h.textContent = title; document.title = title + ' | Vimal Pets & Toys';
      var h1 = '<div class="vpr-bar"><div class="vpr-top"><div class="vpr-count"><b>' + list.length + '</b> item' + (list.length === 1 ? '' : 's') + (S.q ? ' for “' + esc(S.q) + '”' : '') + (base.fuzzy ? ' <i>(showing close matches)</i>' : '') + '</div><div class="vpr-sel">' +
        '<select id="vprPrice" aria-label="Price"><option value="">Any price</option><option value="u500"' + (S.price === 'u500' ? ' selected' : '') + '>Under ₹500</option><option value="500-2000"' + (S.price === '500-2000' ? ' selected' : '') + '>₹500 – ₹2,000</option><option value="2000-10000"' + (S.price === '2000-10000' ? ' selected' : '') + '>₹2,000 – ₹10,000</option><option value="o10000"' + (S.price === 'o10000' ? ' selected' : '') + '>Over ₹10,000</option></select>' +
        '<select id="vprSort" aria-label="Sort"><option value="rel"' + (S.sort === 'rel' ? ' selected' : '') + '>Sort: Best match</option><option value="lh"' + (S.sort === 'lh' ? ' selected' : '') + '>Price: Low to High</option><option value="hl"' + (S.sort === 'hl' ? ' selected' : '') + '>Price: High to Low</option><option value="az"' + (S.sort === 'az' ? ' selected' : '') + '>Name: A to Z</option></select></div></div>';
      if (cats.length > 1 || S.cat) h1 += '<div class="vpr-chips"><button type="button" class="vpr-chip' + (!S.cat ? ' on' : '') + '" data-cat="">All (' + base.length + ')</button>' + cats.map(function (c) { return '<button type="button" class="vpr-chip' + (norm(S.cat) === norm(c[0]) ? ' on' : '') + '" data-cat="' + esc(c[0]) + '">' + esc(c[0]) + ' (' + c[1] + ')</button>'; }).join('') + '</div>';
      h1 += '</div>';
      if (!list.length) {
        h1 += '<div class="vpr-empty"><h2>No items found' + (S.q ? ' for “' + esc(S.q) + '”' : '') + '</h2><div>Try a different spelling, a shorter word, or browse a category.</div><div class="vps-chips">' + POPULAR.map(function (p) { return '<a class="vps-chip" href="' + esc(resultsUrl(p[0])) + '">' + p[1] + ' ' + esc(p[0]) + '</a>'; }).join('') + '</div></div>';
      } else {
        h1 += '<div class="vpr-grid">' + list.slice(0, S.shown).map(function (it) { return card(it, T); }).join('') + '</div>';
        if (list.length > S.shown) h1 += '<button class="vpr-more" type="button" id="vprMore">Show more (' + (list.length - S.shown) + ' left)</button>';
      }
      root.innerHTML = h1;
    }
    function sync(push) { var u = resultsUrl(S.q, S.cat); try { history[push ? 'pushState' : 'replaceState'](null, '', u); } catch (e) {} }
    window.VPS_PAGE = {
      show: function (q, cat, push) { S.q = q || ''; S.cat = cat || ''; S.shown = 24; if (input) input.value = S.q; load(function () { draw(); sync(push); window.scrollTo(0, 0); }); },
      live: function (q) { S.q = q.trim(); S.cat = ''; S.shown = 24; load(function () { draw(); sync(false); }); }
    };
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button, a'); if (!t) return;
      if (t.dataset && t.dataset.add !== undefined) { e.preventDefault(); if (typeof window.addToCart === 'function') window.addToCart(t.dataset.add, Number(t.dataset.price), t.dataset.img); return; }
      if (t.classList.contains('vpr-chip')) { S.cat = t.dataset.cat || ''; S.shown = 24; draw(); sync(false); return; }
      if (t.id === 'vprMore') { S.shown += 24; draw(); }
    });
    root.addEventListener('change', function (e) { if (e.target.id === 'vprSort') { S.sort = e.target.value; draw(); } else if (e.target.id === 'vprPrice') { S.price = e.target.value; draw(); } });
    window.addEventListener('popstate', function () { var p = new URLSearchParams(location.search); S.q = (p.get('q') || '').trim(); S.cat = (p.get('category') || '').trim(); if (input) input.value = S.q; draw(); });
    root.innerHTML = '<div class="vpr-empty">Loading…</div>';
    load(function () { refreshLive(); draw(); });
    if (S.q) saveRecent(S.q);
  }

  window.VPS = { _ready: true, search: search, load: load };
  function boot() { window.searchWebsite = window.searchProducts = window.vimalSearchWebsite = window.searchWebsite; initPage(); if ('requestIdleCallback' in window) requestIdleCallback(function () { load(); }, { timeout: 4000 }); else setTimeout(load, 2500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', function () { refreshLive(); });
})();
