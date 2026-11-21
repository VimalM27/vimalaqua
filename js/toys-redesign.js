/* Vimal27 Toys page.
   - Sections are rendered from CMS content (published via the Admin portal); the built-in defaults reproduce the original design.
   - Products come ONLY from real data: js/products-data.js (+ js/product-meta.js) and the Supabase `products` table. */
(function () {
  'use strict';
  var root = document.querySelector('.v27t');
  if (!root) return;
  var DEFAULTS = window.V27_TOYS_DEFAULTS;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { var w = Math.abs(n - Math.round(n)) < 0.005; return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: w ? 0 : 2, minimumFractionDigits: w ? 0 : 2 }); }
  function safeHttps(u) { try { return new URL(u).protocol === 'https:' ? u : ''; } catch (e) { return ''; } }
  function href(u) { u = String(u || ''); return (/^(https:\/\/|#|\/(?!\/)|[a-zA-Z0-9_][a-zA-Z0-9_\-./%?=&#]*$)/.test(u) && !/^[a-zA-Z][a-zA-Z0-9+.\-]*:(?!\/\/)/.test(u)) ? u : '#'; }
  function src(u) { return /^https:\/\//.test(u || '') ? u : (u ? String(u).replace(/^\/+/, '') : ''); }
  var DAY = 86400000, NEW_DAYS = 30;

  function observeReveal(scope) {
    var els = (scope || root).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }
  root.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && !t.dataset.fellBack) { t.dataset.fellBack = '1'; t.src = t.dataset.fallback || 'images/vimallogo.png'; } }, true);

  /* ---------- section templates (mirror the original static design) ---------- */
  var CROPS = ['85% 20%', '10% 85%', '55% 90%', '15% 10%'];
  var GRAD = 'linear-gradient(135deg,#0a6fb5,#071A3D)';
  var T = {
    hero: function (c) { return '<section class="hero" aria-labelledby="toys-h1"><div class="wrap"><div class="hero-card"><span class="shape s1" aria-hidden="true"></span><span class="shape s2" aria-hidden="true"></span><span class="shape s3" aria-hidden="true"></span>' +
      '<div class="hero-copy"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h1 id="toys-h1">' + esc(c.headingA) + ' <span>' + esc(c.headingB) + '</span></h1><p class="lead">' + esc(c.text) + '</p><div class="hero-cta"><a class="btn btn-primary" href="' + esc(href(c.cta1.href)) + '">' + esc(c.cta1.label) + '</a><a class="btn btn-ghost" href="' + esc(href(c.cta2.href)) + '">' + esc(c.cta2.label) + '</a></div></div>' +
      '<div class="hero-art"><img class="hero-photo" src="' + esc(src(c.image)) + '" data-fallback="images/about-toys.jpg" alt="' + esc(c.imageAlt) + '" width="800" height="800" fetchpriority="high"><span class="label l1">' + esc(c.labels[0]) + '</span><span class="label l2">' + esc(c.labels[1]) + '</span><span class="label l3">' + esc(c.labels[2]) + '</span></div></div></div></section>'; },
    categories: function (c) { return '<section class="cats" id="categories" aria-labelledby="cat-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="cat-h">' + esc(c.heading) + '</h2><p>' + esc(c.subtitle) + '</p></div><div class="cat-grid">' +
      c.items.filter(function (i) { return i.enabled; }).map(function (i) { return '<a class="cat-card reveal" style="--bg:' + esc(i.bg) + '" href="' + esc(href(i.href)) + '"><div class="cat-img"><img src="' + esc(src(i.image) || 'images/vimallogo.png') + '" alt="' + esc(i.name) + '" loading="lazy" decoding="async" width="300" height="300"></div><div class="cat-name">' + esc(i.name) + '</div></a>'; }).join('') +
      '</div><div class="cat-more reveal"><a class="btn btn-ghost" href="#all-collections">Browse every collection</a></div></div></section>'; },
    collections: function (c) { return '<section class="collections" id="collections" aria-labelledby="col-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="col-h">' + esc(c.heading) + '</h2></div><div class="col-grid">' +
      c.items.filter(function (i) { return i.enabled; }).map(function (i, n) { var bg = i.image ? 'center/cover no-repeat url(' + esc(src(i.image)) + ')' : 'center/230% no-repeat url(images/about-toys.jpg) ' + CROPS[n % 4]; return '<a class="col-card reveal" href="' + esc(href(i.href)) + '"><div class="col-bg" style="background:' + bg + '"></div><div class="col-body"><span class="col-tag">' + esc(i.tag) + '</span><h3>' + esc(i.title) + '</h3><p>' + esc(i.desc) + '</p><span class="btn btn-white btn-sm">Explore Collection →</span></div></a>'; }).join('') + '</div></div></section>'; },
    popular: function (c) { return '<section class="picks" id="popular" aria-labelledby="pop-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="pop-h">' + esc(c.heading) + '</h2><p>' + esc(c.subtitle) + '</p></div><div class="prod-grid" id="popular-grid"></div></div></section>'; },
    promo: function (c) { return '<section class="promo"><div class="wrap"><div class="promo-card reveal"><div class="promo-copy"><span class="eyebrow" style="color:#D4AF37">' + esc(c.eyebrow) + '</span><h2>' + esc(c.headingA) + ' <em>' + esc(c.headingB) + '</em></h2><p>' + esc(c.text) + '</p><a class="btn btn-gold" href="' + esc(href(c.cta.href)) + '">' + esc(c.cta.label) + '</a></div><div class="promo-img" role="img" aria-label="Colourful toys" style="background-image:url(' + esc(src(c.image) || 'images/about-toys.jpg') + ')"></div></div></div></section>'; },
    arrivals: function (c) { return '<section class="arrivals" id="arrivals" aria-labelledby="new-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="new-h">' + esc(c.heading) + '</h2></div><div class="car-wrap"><button type="button" class="car-btn prev" aria-label="Previous">‹</button><div class="carousel" id="arrivals-track"></div><button type="button" class="car-btn next" aria-label="Next">›</button></div></div></section>'; },
    why: function (c) { var bgs = ['#EAF8FF', '#FFF8EA', '#E8F8EF', '#F0EDFF']; return '<section class="why" aria-labelledby="why-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="why-h">' + esc(c.heading) + '</h2></div><div class="why-grid">' +
      c.items.map(function (i, n) { return '<div class="why-card reveal" style="--bg:' + bgs[n % 4] + '"><div class="why-ic"><i class="fa-solid ' + esc(i.icon) + '" aria-hidden="true"></i></div><h3>' + esc(i.title) + '</h3><p>' + esc(i.text) + '</p></div>'; }).join('') + '</div></div></section>'; },
    life: function (c) { var bgs = ['#FFF1B8', '#EAF8FF', '#FFE8EF', '#E8F8EF'], tiles = c.items.filter(function (i) { return i.image; }); if (!tiles.length) return '';
      return '<section class="life" id="life" aria-labelledby="life-h"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2 id="life-h">' + esc(c.heading) + '</h2></div><div class="life-grid">' +
      tiles.map(function (i, n) { return '<div class="life-tile reveal" style="--bg:' + bgs[n % 4] + '"><div class="col-bg" style="background-image:url(' + esc(src(i.image)) + ')"></div><span>' + esc(i.label) + '</span></div>'; }).join('') + '</div></div></section>'; },
    final: function (c) { return '<section class="final"><div class="wrap"><div class="final-card reveal"><h2>' + esc(c.heading) + '</h2><p>' + esc(c.text) + '</p><a class="btn btn-gold" href="' + esc(href(c.cta.href)) + '">' + esc(c.cta.label) + '</a></div></div></section>'; }
  };
  var dirNode = root.querySelector('#all-collections'); if (dirNode) dirNode.parentNode.removeChild(dirNode);
  var currentCfg = DEFAULTS, mounted = null;
  function renderAll(cfg) {
    currentCfg = cfg;
    var html = cfg.order.map(function (id) { var s = cfg.sections[id]; if (!s || !s.enabled) return ''; return id === 'directory' ? '<div data-dir-slot></div>' : (T[id] ? T[id](s) : ''); }).join('');
    root.innerHTML = html;
    var slot = root.querySelector('[data-dir-slot]');
    if (slot && dirNode) { var d = cfg.sections.directory; dirNode.querySelector('h2').textContent = d.heading; dirNode.querySelector('.sec-head p').textContent = d.subtitle; slot.replaceWith(dirNode); }
    hydrate(); observeReveal();
  }

  /* ---------- wishlist + cart: same storage shape as the rest of the site ---------- */
  var WL = 'vimalWishlist';
  function getWL() { try { var l = JSON.parse(localStorage.getItem(WL)) || []; return l.map(function (i) { return typeof i === 'string' ? { name: i, price: null, image: '' } : i; }); } catch (e) { return []; } }
  function saveWL(l) { try { localStorage.setItem(WL, JSON.stringify(l)); } catch (e) {} var c = document.getElementById('wishlistCount'); if (c) c.textContent = l.length; }
  function inWL(name) { return getWL().some(function (i) { return i.name === name; }); }
  function toggleWL(p, btn) {
    var l = getWL(), has = l.some(function (i) { return i.name === p.name; });
    l = has ? l.filter(function (i) { return i.name !== p.name; }) : l.concat([{ name: p.name, price: p.price, image: p.image }]);
    saveWL(l); btn.classList.toggle('on', !has); btn.textContent = has ? '♡' : '♥';
    btn.setAttribute('aria-pressed', String(!has));
  }
  (function () { var c = document.getElementById('wishlistCount'); if (c) c.textContent = getWL().length; })();

  /* ---------- 1) products from the site's own catalogue ---------- */
  var META = window.VPW_META || {};
  function stateOf(p, m) {
    m = m || {};
    if (m.stock != null && m.stock !== '') return Number(m.stock) > 0 ? 'in' : 'out';
    var a = String(m.availability || '').toLowerCase();
    if (a) return /^(in[_ ]?stock|available)$/.test(a) ? 'in' : (/out/.test(a) ? 'out' : 'ask');
    var b = String(p.availability || '').toLowerCase();
    if (/^available$/.test(b)) return 'in'; if (/out|sold/.test(b)) return 'out'; return 'ask';
  }
  function fromCatalogue() {
    var all = Array.isArray(window.VPW_PRODUCTS) ? window.VPW_PRODUCTS : [];
    return all.filter(function (p) { return p.category === 'Toys'; }).map(function (p) {
      var m = META[p.slug] || {};
      var price = (m.price != null && m.price !== '') ? Number(m.price) : p.price;
      var created = m.createdAt ? Date.parse(m.createdAt) : NaN;
      var orig = Number(m.originalPrice || p.originalPrice || p.mrp || 0);
      return {
        key: 'c:' + p.slug, name: p.name, price: p.priceOnRequest ? null : price,
        orig: orig > price ? orig : 0,
        image: (p.images && p.images[0]) || '', state: stateOf(p, m),
        created: isNaN(created) ? null : created,
        detail: 'product.html?id=' + encodeURIComponent(p.slug), kind: 'cart'
      };
    });
  }

  /* ---------- 2) partner products (Supabase, same query as marketplace.html) ---------- */
  var TOYISH = /toy|game|puzzle|doll|plush|block|lego|remote|\brc\b|robot|\bcar(s)?\b|vehicle|kid|baby|educational|stem|board|play|craft|art kit|building/i;
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function fromSupabase() {
    var p = (window.supabase ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'));
    return p.then(function () { return typeof supabaseClient !== 'undefined' ? null : loadScript('js/supabaseClient.js'); })
      .then(function () {
        return Promise.all([
          supabaseClient.from('public_shops').select('*'),
          supabaseClient.from('products').select('*').order('created_at', { ascending: false })
        ]);
      }).then(function (r) {
        if (r[0].error || r[1].error) return [];
        var shops = {}; (r[0].data || []).forEach(function (s) { shops[s.id] = s; });
        return (r[1].data || []).filter(function (x) {
          return shops[x.shop_owner_id] && x.is_active !== false && TOYISH.test((x.category || '') + ' ' + (x.product_name || ''));
        }).map(function (x) {
          var shop = shops[x.shop_owner_id], link = safeHttps(x.product_url), t = Date.parse(x.created_at);
          var num = String(shop.whatsapp || shop.phone || '').replace(/\D/g, '').slice(-10);
          var buy = link || (num.length === 10 ? 'https://wa.me/91' + num + '?text=' + encodeURIComponent('Hi, I\'m interested in "' + x.product_name + '" listed on Vimal Pets & Toys.') : '');
          var st = x.stock == null ? 'ask' : (Number(x.stock) > 0 ? 'in' : 'out');
          return {
            key: 's:' + x.id, name: x.product_name, price: Number(x.price), orig: 0, image: safeHttps(x.image_url) || '',
            state: st, created: isNaN(t) ? null : t, detail: 'marketplace.html?seller=' + encodeURIComponent(x.shop_owner_id),
            kind: 'link', buy: buy, buyLabel: link ? 'Buy on ' + shop.shop_name : 'Enquire on WhatsApp', shop: shop.shop_name
          };
        });
      }).catch(function () { return []; });
  }

  /* ---------- rendering ---------- */
  var REG = {};
  function card(p, allowNew) {
    REG[p.key] = p;
    var isNew = allowNew && p.created && (Date.now() - p.created) <= NEW_DAYS * DAY;
    var img = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="400" height="400" data-fallback="images/vimallogo.png">' : '<img src="images/vimallogo.png" alt="" loading="lazy" width="400" height="400">';
    var price = p.price == null ? '<span class="price" style="font-size:15px">Price on request</span>' :
      '<span class="price">' + inr(p.price) + '</span>' + (p.orig ? '<span class="price-old">' + inr(p.orig) + '</span><span class="price-off">' + Math.round((1 - p.price / p.orig) * 100) + '% off</span>' : '');
    var stock = p.state === 'in' ? '<span class="stock in">In stock</span>' : p.state === 'out' ? '<span class="stock out">Out of stock</span>' : '<span class="stock ask">Contact to confirm</span>';
    var actions = '<a class="btn btn-ghost btn-sm" href="' + esc(p.detail) + '">' + (p.kind === 'cart' ? 'Details' : 'View shop') + '</a>';
    if (p.kind === 'cart') actions += '<button type="button" class="btn btn-primary btn-sm" data-add="' + esc(p.key) + '"' + (p.state === 'out' || p.price == null ? ' disabled' : '') + '>' + (p.state === 'out' ? 'Sold out' : 'Add to Cart') + '</button>';
    else if (p.buy && p.state !== 'out') actions += '<a class="btn btn-primary btn-sm" href="' + esc(p.buy) + '" target="_blank" rel="noopener noreferrer nofollow sponsored">' + esc(p.buyLabel) + '</a>';
    var liked = inWL(p.name);
    return '<article class="prod-card reveal"><div class="prod-img"><a href="' + esc(p.detail) + '" tabindex="-1" aria-hidden="true" style="display:block;height:100%">' + img + '</a>' +
      (isNew ? '<span class="badge">New</span>' : '') +
      '<button type="button" class="wish' + (liked ? ' on' : '') + '" data-wish="' + esc(p.key) + '" aria-pressed="' + liked + '" aria-label="Add ' + esc(p.name) + ' to wishlist">' + (liked ? '♥' : '♡') + '</button></div>' +
      '<div class="prod-body"><h3 class="prod-name">' + esc(p.name) + '</h3><div class="prod-price">' + price + '</div>' + stock +
      '<div class="prod-actions">' + actions + '</div></div></article>';
  }

  root.addEventListener('click', function (e) {
    var w = e.target.closest('[data-wish]'); if (w) { var p = REG[w.getAttribute('data-wish')]; if (p) toggleWL(p, w); return; }
    var a = e.target.closest('[data-add]');
    if (a && !a.disabled) {
      var q = REG[a.getAttribute('data-add')]; if (!q || q.price == null) return;
      if (typeof window.addToCart === 'function') window.addToCart(q.name, q.price, q.image);
    }
  });

  function dedupe(list) { var seen = {}; return list.filter(function (p) { var k = p.name.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; }); }

  /* ---------- hydrate dynamic product sections ---------- */
  var allProducts = null;
  function hydrate() { if (allProducts) renderProducts(allProducts); bindCarousel(); }
  function bindCarousel() {
    var track = root.querySelector('#arrivals-track'); if (!track) return;
    root.querySelectorAll('.car-btn').forEach(function (b) { b.onclick = function () { track.scrollBy({ left: b.classList.contains('next') ? Math.max(track.clientWidth * 0.8, 240) : -Math.max(track.clientWidth * 0.8, 240), behavior: reduce ? 'auto' : 'smooth' }); }; });
  }
  function renderProducts(products) {
    products = dedupe(products);
    var pc = currentCfg.sections.popular, picks = root.querySelector('#popular-grid'), picksSec = root.querySelector('#popular');
    var arr = root.querySelector('#arrivals-track'), arrSec = root.querySelector('#arrivals');
    if (picks) {
      var ranked;
      if (pc.mode === 'manual') { var byKey = {}; products.forEach(function (p) { byKey[p.key] = p; }); ranked = pc.featured.map(function (k) { return byKey[k]; }).filter(Boolean).slice(0, pc.limit); }
      else ranked = products.slice().sort(function (a, b) { var s = (b.state === 'in') - (a.state === 'in'); if (s) return s; return (b.created || 0) - (a.created || 0); }).slice(0, pc.limit);
      if (ranked.length) picks.innerHTML = ranked.map(function (p) { return card(p, true); }).join(''); else picksSec.hidden = true;
    }
    if (arr) {
      var fresh = products.filter(function (p) { return p.created; }).sort(function (a, b) { return b.created - a.created; }).slice(0, 12);
      if (fresh.length) arr.innerHTML = fresh.map(function (p) { return card(p, true); }).join(''); else arrSec.hidden = true;
    }
    observeReveal();
  }

  /* ---------- boot ---------- */
  var base = fromCatalogue();
  allProducts = base;
  // 1) Static HTML already equals the defaults -> just fill products. 2) Then apply CMS content if different.
  observeReveal(); renderProducts(base); bindCarousel();

  var preview = /[?&]preview=1\b/.test(location.search);
  function banner() { var b = document.createElement('div'); b.setAttribute('role', 'status'); b.style.cssText = 'position:sticky;top:0;z-index:999;background:#D4AF37;color:#071A3D;text-align:center;font:600 14px Poppins,sans-serif;padding:10px'; b.textContent = 'PREVIEW — unpublished draft. Visitors do not see this. Close this tab and click Publish in Admin to go live.'; document.body.insertBefore(b, document.body.firstChild); }
  function applyCfg(cfg, isPreview) { if (!cfg || !cfg.order || !cfg.sections) return; if (JSON.stringify(cfg) === JSON.stringify(DEFAULTS) && !isPreview) return; renderAll(cfg); root.setAttribute('data-cms-rendered', '1'); if (isPreview) banner(); }
  var done = (preview
    ? fetch('/api/admin/toys-page/preview', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.content) applyCfg(j.content, true); return !!(j && j.content); }).catch(function () { return false; })
    : Promise.resolve(false)
  ).then(function (usedPreview) {
    if (usedPreview) return;
    return fetch('/api/toys-content', { cache: 'default' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.content) applyCfg(j.content, false); }).catch(function () { /* keep defaults */ });
  });
  done.then(function () { fromSupabase().then(function (extra) { if (extra.length) { allProducts = base.concat(extra); renderProducts(allProducts); } }); });
})();
