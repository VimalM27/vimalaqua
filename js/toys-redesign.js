/* Vimal27 Toys page — data-driven sections. No fake products: everything rendered here comes from
   (1) window.VPW_PRODUCTS / window.VPW_META (js/products-data.js, js/product-meta.js) and
   (2) the Supabase `products` table already used by marketplace.html. Sections with no data hide themselves. */
(function () {
  'use strict';
  var root = document.querySelector('.v27t');
  if (!root) return;

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: Math.abs(n - Math.round(n)) < 0.005 ? 0 : 2, minimumFractionDigits: Math.abs(n - Math.round(n)) < 0.005 ? 0 : 2 }); }
  function safeHttps(u) { try { return new URL(u).protocol === 'https:' ? u : ''; } catch (e) { return ''; } }
  function slugify(s) { return String(s || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  var DAY = 86400000, NEW_DAYS = 30;

  /* ---------- OPTIONAL PHOTOS ----------
     Upload your own photography to images/toys-redesign/ and list the file names here.
     Anything left '' keeps the built-in look (no missing-file requests). */
  var PHOTOS = {
    hero: '',                       // e.g. 'images/toys-redesign/hero.jpg'
    promo: '',
    cats: {},                       // e.g. { rc: 'images/toys-redesign/cat-rc.jpg', cars: '...' }
    collections: {},                // keys: speed, learn, cuddle, build
    life: {}                        // keys: blocks, rc, soft, learn  -> section appears once any is set
  };
  (function applyPhotos() {
    if (PHOTOS.hero) { var h = document.getElementById('heroPhoto'); if (h) h.src = PHOTOS.hero; }
    if (PHOTOS.promo) { var pm = root.querySelector('.promo-img'); if (pm) pm.style.backgroundImage = 'url(' + PHOTOS.promo + ')'; }
    Object.keys(PHOTOS.cats).forEach(function (k) { var i = root.querySelector('img[data-cat="' + k + '"]'); if (i && PHOTOS.cats[k]) i.src = PHOTOS.cats[k]; });
    Object.keys(PHOTOS.collections).forEach(function (k) { var d = root.querySelector('[data-col="' + k + '"]'); if (d && PHOTOS.collections[k]) d.style.background = 'center/cover url(' + PHOTOS.collections[k] + ')'; });
    var L = { blocks: ['Building blocks, built together', '#FFF1B8'], rc: ['RC cars on the track', '#EAF8FF'], soft: ['Soft toys in a cosy room', '#FFE8EF'], learn: ['Learning toys on a clean table', '#E8F8EF'] };
    var html = Object.keys(L).filter(function (k) { return PHOTOS.life[k]; }).map(function (k) {
      return '<div class="life-tile reveal" style="--bg:' + L[k][1] + '"><div class="col-bg" style="background-image:url(' + esc(PHOTOS.life[k]) + ')"></div><span>' + L[k][0] + '</span></div>';
    }).join('');
    if (html) { root.querySelector('#life-grid').innerHTML = html; root.querySelector('#life').hidden = false; }
  })();

  /* ---------- reveal on scroll ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function observeReveal(scope) {
    var els = (scope || root).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }
  observeReveal();

  /* ---------- image fallbacks (category tiles etc.) ---------- */
  root.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.dataset.fallback && !t.dataset.fellBack) {
      t.dataset.fellBack = '1'; t.src = t.dataset.fallback;
    }
  }, true);

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

  function render(products) {
    products = dedupe(products);
    var picks = root.querySelector('#popular-grid'), picksSec = root.querySelector('#popular');
    var arr = root.querySelector('#arrivals-track'), arrSec = root.querySelector('#arrivals');
    // No sales data exists, so "Popular Picks" = available toys, newest first. Nothing is invented.
    var ranked = products.slice().sort(function (a, b) {
      var s = (b.state === 'in') - (a.state === 'in'); if (s) return s; return (b.created || 0) - (a.created || 0);
    }).slice(0, 8);
    if (ranked.length) { picks.innerHTML = ranked.map(function (p) { return card(p, true); }).join(''); }
    else picksSec.hidden = true;

    var fresh = products.filter(function (p) { return p.created; }).sort(function (a, b) { return b.created - a.created; }).slice(0, 12);
    if (fresh.length) { arr.innerHTML = fresh.map(function (p) { return card(p, true); }).join(''); }
    else arrSec.hidden = true;
    observeReveal();
  }

  var base = fromCatalogue();
  render(base);                         // instant render from local catalogue
  fromSupabase().then(function (extra) { if (extra.length) render(base.concat(extra)); });

  /* ---------- carousel ---------- */
  var track = root.querySelector('#arrivals-track');
  root.querySelectorAll('.car-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var step = Math.max(track.clientWidth * 0.8, 240);
      track.scrollBy({ left: b.classList.contains('next') ? step : -step, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
