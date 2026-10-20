/* Vimal Pets & Toys: shared catalogue layer.
   Load AFTER js/products-data.js and js/product-meta.js. It does not replace any existing file.
   One source of truth: window.VPW_PRODUCTS (products-data.js) + window.VPW_META (product-meta.js).
   It (1) merges both, (2) tidies every product card (name, price, image, availability, button),
   (3) adds search / category / price / availability / sort / clear / count / empty-state controls,
   (4) makes the cart use the same numeric prices as the catalogue. */
(function () {
  'use strict';
  if (window.VPW && window.VPW._ready) return;

  var CFG = window.VPW_CONFIG || {};
  var WHATSAPP = CFG.whatsapp || '917845452727';
  /* 'enquire' = items that are NOT in products-data.js show "Contact to Confirm" + "Enquire Now".
     Set VPW_CONFIG.unlisted = 'cart' to let them be bought normally. */
  var UNLISTED = CFG.unlisted || 'enquire';
  var PLACEHOLDER = CFG.placeholderPatterns || [/toys-art\//, /toys-placeholders\//, /vimallogo/i, /-icon\.(jpg|jpeg|png|svg)$/i];
  var FALLBACK_IMG = CFG.fallbackImage || 'images/vimallogo.png';

  var PRODUCTS = Array.isArray(window.VPW_PRODUCTS) ? window.VPW_PRODUCTS : [];
  var META = window.VPW_META || {};

  /* ---------- helpers ---------- */
  function slugify(s) { return String(s || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  function cleanName(s) { return String(s || '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/\s+[–—-]\s+/g, ' – ').trim(); }
  function parseNum(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    var m = String(v == null ? '' : v).replace(/,/g, '').match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }
  function formatINR(n) {
    if (n == null || isNaN(n)) return '';
    var whole = Math.abs(n - Math.round(n)) < 0.005;
    return '₹' + Number(n).toLocaleString('en-IN', whole ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isPlaceholder(src) { return !src || PLACEHOLDER.some(function (r) { return r.test(src); }); }
  function toast(msg) { if (typeof window.showToast === 'function') window.showToast(msg); else alert(msg); }

  /* ---------- 1. merge catalogue + meta (single source of truth) ---------- */
  var BY_SLUG = {}, BY_NAME = {};
  function stateOf(p, m) {
    var a = m.availability ? String(m.availability).toLowerCase() : null;
    if (m.stock != null && m.stock !== '') return Number(m.stock) > 0 ? 'in_stock' : 'out_of_stock';
    if (a) { if (/^(in[_ ]?stock|available)$/.test(a)) return 'in_stock'; if (/out/.test(a)) return 'out_of_stock'; return 'contact'; }
    var base = String(p.availability || '').toLowerCase();
    if (/^available$/.test(base)) return 'in_stock';
    if (/out of stock|sold/.test(base)) return 'out_of_stock';
    return 'contact';
  }
  PRODUCTS.forEach(function (p) {
    var m = META[p.slug] || {};
    if (m.price != null && m.price !== '') { p.price = Number(m.price); p.priceOnRequest = false; }
    if (m.priceOnRequest === true) p.priceOnRequest = true;
    if (m.brand) p.brand = m.brand;
    if (m.keywords) p.keywords = m.keywords;
    if (m.createdAt) p.createdAt = m.createdAt;
    if (m.images && m.images.length) p.images = m.images;
    if (m.stock != null && m.stock !== '') p.stock = Number(m.stock);
    p._state = stateOf(p, m);
    p.availability = p._state === 'in_stock' ? 'Available' : p._state === 'out_of_stock' ? 'Out of Stock' : 'Contact for Availability';
    p.price = p.priceOnRequest ? null : parseNum(p.price);
    p._noPhoto = !p.images || !p.images.length || isPlaceholder(p.images[0]);
    p._created = p.createdAt ? Date.parse(p.createdAt) || 0 : 0;
    BY_SLUG[p.slug] = p; BY_NAME[slugify(p.name)] = p;
  });
  var HAS_DATES = PRODUCTS.some(function (p) { return p._created; });
  var CATEGORIES = [], CAT_PAGE = {};
  PRODUCTS.forEach(function (p) { if (CATEGORIES.indexOf(p.category) < 0) CATEGORIES.push(p.category); if (p.categoryPage) CAT_PAGE[p.category] = p.categoryPage; });

  function productUrl(slug) { return 'product.html?id=' + encodeURIComponent(slug); }
  function waLink(rec, kind) {
    var t = 'Hi Vimal Pets & Toys, I would like to ' + (kind === 'price' ? 'know the price of ' : 'confirm availability of ') + rec.name + '. ' + location.href;
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t);
  }

  /* ---------- 2. card tidy-up ---------- */
  var PAGE_CATEGORY = null;
  function ghostFrom(card, name) {
    var priceEl = card.querySelector('.price'), img = card.querySelector('img');
    var desc = card.querySelector('.description');
    return {
      slug: slugify(name), name: name, category: PAGE_CATEGORY || 'Products', type: 'product', price: parseNum(priceEl && priceEl.textContent),
      priceOnRequest: false, images: img ? [img.getAttribute('src')] : [], description: desc ? desc.textContent.trim() : '',
      _state: UNLISTED === 'cart' ? 'in_stock' : 'contact', _noPhoto: !img || isPlaceholder(img.getAttribute('src')), _created: 0, _ghost: true
    };
  }
  function recFor(card) {
    var h = card.querySelector('h2, h3, h4'); if (!h) return null;
    var name = cleanName(h.textContent);
    var rec = BY_SLUG[card.getAttribute('data-slug') || ''] || BY_NAME[slugify(name)] || ghostFrom(card, name);
    if (rec._ghost && (rec.price == null)) rec.priceOnRequest = true;
    return rec;
  }
  function ctaOf(rec) {
    if (rec.priceOnRequest || rec.price == null) return 'price';
    if (rec._state === 'out_of_stock') return 'out';
    if (rec._state === 'contact') return 'enquire';
    return 'cart';
  }
  function haystack(rec) {
    var spec = rec.specifications || {};
    return [rec.name, rec.category, rec.brand, spec.brand, spec.breedSpecies, spec.productType, (rec.keywords || []).join(' '), rec.type, rec.sku, rec.description].filter(Boolean).join(' ').toLowerCase();
  }
  function hydrate(card, rec) {
    rec = rec || recFor(card); if (!rec) return null;
    card.classList.add('vpw-card');
    card.setAttribute('data-slug', rec.slug);
    card.setAttribute('data-state', rec._state);
    if (rec._ghost) card.setAttribute('data-unlisted', '1');
    var h = card.querySelector('h2, h3, h4'); h.textContent = rec.name; h.title = rec.name; h.classList.add('vpw-name');
    var desc = card.querySelector('.description'); if (desc) desc.classList.add('vpw-desc');

    /* price */
    var priceEl = card.querySelector('.price');
    if (!priceEl) { priceEl = document.createElement('p'); priceEl.className = 'price'; (card.querySelector('button') || card.lastChild).parentNode.insertBefore(priceEl, card.querySelector('button')); }
    priceEl.classList.add('vpw-price');
    priceEl.textContent = (rec.priceOnRequest || rec.price == null) ? 'Price on request' : formatINR(rec.price);
    card.setAttribute('data-price', rec.price == null ? '' : rec.price);

    /* availability badge: only what the data says */
    var badge = card.querySelector('.vpw-stock');
    if (!badge) { badge = document.createElement('span'); priceEl.parentNode.insertBefore(badge, priceEl.nextSibling); }
    var label = rec._state === 'in_stock' ? 'In Stock' : rec._state === 'out_of_stock' ? 'Out of Stock' : 'Contact to Confirm';
    badge.className = 'vpw-stock vpw-s-' + (rec._state === 'in_stock' ? 'in' : rec._state === 'out_of_stock' ? 'out' : 'contact');
    badge.textContent = label;

    /* image: fixed frame, same crop; flag stand-ins instead of pretending */
    var img = card.querySelector('img');
    if (img) {
      var src = (rec.images && rec.images[0] && !rec._ghost) ? rec.images[0] : img.getAttribute('src');
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
      img.setAttribute('alt', rec.name); img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async');
      img.classList.add('vpw-img');
      img.onerror = function () { img.onerror = null; img.src = FALLBACK_IMG; card.classList.add('vpw-nophoto'); };
      if (!img.parentNode.classList.contains('vpw-imgwrap')) {
        var w = document.createElement('span'); w.className = 'vpw-imgwrap';
        img.parentNode.insertBefore(w, img); w.appendChild(img);
      }
      card.classList.toggle('vpw-nophoto', !!(rec._noPhoto || isPlaceholder(src)));
    }

    /* button: one honest action per product */
    var btn = null;
    Array.prototype.forEach.call(card.querySelectorAll('button'), function (b) { if (!btn && !b.classList.contains('wishlist-btn') && /cart|contact|enquire|out of stock|notify/i.test(b.textContent)) btn = b; });
    if (btn) {
      var fresh = btn.cloneNode(false); /* drops older click handlers so nothing double-fires */
      fresh.removeAttribute('onclick'); fresh.setAttribute('data-cart-bound', 'true'); fresh.type = 'button';
      var cta = ctaOf(rec);
      fresh.className = 'vpw-btn vpw-btn-' + cta;
      fresh.textContent = cta === 'cart' ? 'Add to Cart' : cta === 'price' ? 'Contact for Price' : cta === 'enquire' ? 'Enquire Now' : 'Out of Stock';
      if (cta === 'out') { fresh.disabled = true; fresh.setAttribute('aria-disabled', 'true'); }
      fresh.addEventListener('click', function (e) {
        e.stopPropagation();
        if (cta === 'cart') window.addToCart(rec.name, rec.price, (rec.images && rec.images[0] && !rec._ghost) ? rec.images[0] : (img ? img.getAttribute('src') : ''));
        else if (cta === 'price' || cta === 'enquire') window.open(waLink(rec, cta), '_blank', 'noopener');
      });
      btn.parentNode.replaceChild(fresh, btn);
    }
    card._rec = rec; card._hay = haystack(rec);
    return rec;
  }
  function hydrateAll(root) {
    var cards = Array.prototype.slice.call((root || document).querySelectorAll('.product-card'));
    cards.forEach(function (c) { hydrate(c); });
    return cards;
  }

  /* ---------- 3. filters ---------- */
  var NARROW = {}; /* tiny synonym help so "puppy" finds Dogs, "kitten" finds Cats, etc. */
  [['dog', 'puppy'], ['cat', 'kitten'], ['fish', 'aquarium'], ['bird', 'parrot']].forEach(function (g) { NARROW[g[1]] = g[0]; });
  function tokens(q) { return String(q || '').toLowerCase().split(/\s+/).filter(Boolean).map(function (t) { t = NARROW[t] || t; return t.length > 3 ? t.replace(/s$/, '') : t; }); }
  function matches(rec, hay, toks) { return toks.every(function (t) { return hay.indexOf(t) >= 0; }); }
  function relevance(rec, toks) {
    var n = rec.name.toLowerCase(), s = 0;
    toks.forEach(function (t) { if (n.indexOf(t) === 0) s += 12; else if (n.indexOf(t) >= 0) s += 8; if ((rec.category || '').toLowerCase().indexOf(t) >= 0) s += 4; });
    return s;
  }

  function mountBar(opts) {
    var grid = opts.grid, items = opts.items, globalMode = !!opts.globalMode;
    var total = items.length;
    var bar = document.createElement('form');
    bar.className = 'vpw-bar'; bar.setAttribute('role', 'search'); bar.setAttribute('aria-label', 'Search and filter products');
    var catOpts = '<option value="">All categories</option>' + CATEGORIES.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('');
    bar.innerHTML =
      '<div class="vpw-f vpw-f-q"><label for="vpwQ">Search</label><input id="vpwQ" type="search" placeholder="Name, brand or keyword" autocomplete="off"></div>' +
      '<div class="vpw-f"><label for="vpwCat">Category</label><select id="vpwCat">' + catOpts + '</select></div>' +
      '<div class="vpw-f vpw-f-price"><label for="vpwMin">Price (₹)</label><div class="vpw-range"><input id="vpwMin" type="number" min="0" inputmode="numeric" placeholder="Min"><span>–</span><input id="vpwMax" type="number" min="0" inputmode="numeric" placeholder="Max" aria-label="Maximum price"></div></div>' +
      '<div class="vpw-f"><label for="vpwAv">Availability</label><select id="vpwAv"><option value="">All items</option><option value="in">In stock only</option></select></div>' +
      '<div class="vpw-f"><label for="vpwSort">Sort by</label><select id="vpwSort"><option value="featured">' + (globalMode ? 'Best match' : 'Featured') + '</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option>' + (HAS_DATES ? '<option value="new">Newest first</option>' : '') + '<option value="name">Name: A to Z</option></select></div>' +
      '<div class="vpw-f vpw-f-actions"><button type="button" class="vpw-clear" id="vpwClear">Clear Filters</button></div>' +
      '<p class="vpw-count" id="vpwCount" role="status" aria-live="polite"></p>';
    grid.parentNode.insertBefore(bar, grid);
    var empty = document.createElement('div');
    empty.className = 'vpw-empty'; empty.hidden = true;
    empty.innerHTML = '<div class="vpw-empty-ico" aria-hidden="true">🔍</div><h3>No products found</h3><p>Try a different keyword, widen the price range, or turn off “In stock only”.</p><button type="button" class="vpw-clear">Clear Filters</button>';
    grid.parentNode.insertBefore(empty, grid.nextSibling);

    var $ = function (id) { return bar.querySelector('#' + id); };
    var qEl = $('vpwQ'), catEl = $('vpwCat'), minEl = $('vpwMin'), maxEl = $('vpwMax'), avEl = $('vpwAv'), sortEl = $('vpwSort'), countEl = $('vpwCount');
    var pageCat = opts.pageCategory || '';
    if (!items.some(function (it) { return it.rec._state === 'in_stock'; })) {
      var opt = bar.querySelector('#vpwAv option[value="in"]'); opt.disabled = true; opt.textContent = 'In stock only (not confirmed here)';
    }
    if (!globalMode) catEl.value = pageCat;

    /* read state from URL */
    var sp = new URLSearchParams(location.search);
    qEl.value = sp.get('q') || ''; minEl.value = sp.get('min') || ''; maxEl.value = sp.get('max') || '';
    avEl.value = sp.get('avail') === 'in' ? 'in' : '';
    var so = sp.get('sort'); if (so && sortEl.querySelector('option[value="' + so + '"]')) sortEl.value = so;
    if (globalMode && sp.get('category')) catEl.value = sp.get('category');

    function sync() {
      var p = new URLSearchParams();
      if (qEl.value.trim()) p.set('q', qEl.value.trim());
      if (globalMode && catEl.value) p.set('category', catEl.value);
      if (minEl.value !== '') p.set('min', minEl.value);
      if (maxEl.value !== '') p.set('max', maxEl.value);
      if (avEl.value) p.set('avail', avEl.value);
      if (sortEl.value !== 'featured') p.set('sort', sortEl.value);
      var s = p.toString();
      try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); } catch (e) {}
    }
    function active() { return !!(qEl.value.trim() || minEl.value !== '' || maxEl.value !== '' || avEl.value || sortEl.value !== 'featured' || (globalMode && catEl.value)); }

    function apply() {
      var toks = tokens(qEl.value);
      var min = minEl.value === '' ? null : parseFloat(minEl.value), max = maxEl.value === '' ? null : parseFloat(maxEl.value);
      var shown = items.filter(function (it) {
        var r = it.rec;
        if (globalMode && catEl.value && r.category !== catEl.value) return false;
        if (toks.length && !matches(r, it.hay, toks)) return false;
        if (min != null || max != null) { if (r.price == null) return false; if (min != null && r.price < min) return false; if (max != null && r.price > max) return false; }
        if (avEl.value === 'in' && r._state !== 'in_stock') return false;
        return true;
      });
      var s = sortEl.value;
      var byIdx = function (a, b) { return a.idx - b.idx; };
      shown.sort(function (a, b) {
        var ra = a.rec, rb = b.rec;
        if (s === 'low' || s === 'high') {
          if (ra.price == null && rb.price == null) return byIdx(a, b);
          if (ra.price == null) return 1; if (rb.price == null) return -1;
          return (s === 'low' ? ra.price - rb.price : rb.price - ra.price) || byIdx(a, b);
        }
        if (s === 'new') { if (!ra._created && !rb._created) return byIdx(a, b); if (!ra._created) return 1; if (!rb._created) return -1; return (rb._created - ra._created) || byIdx(a, b); }
        if (s === 'name') return ra.name.localeCompare(rb.name) || byIdx(a, b);
        if (globalMode && toks.length) return (relevance(rb, toks) - relevance(ra, toks)) || byIdx(a, b);
        return byIdx(a, b);
      });
      items.forEach(function (it) { it.el.style.display = 'none'; it.el.hidden = true; });
      var frag = document.createDocumentFragment();
      shown.forEach(function (it) { it.el.style.display = ''; it.el.hidden = false; frag.appendChild(it.el); });
      grid.appendChild(frag);
      var n = shown.length;
      countEl.textContent = active() ? ('Showing ' + n + ' of ' + total + ' product' + (total === 1 ? '' : 's')) : (total + ' product' + (total === 1 ? '' : 's'));
      empty.hidden = n !== 0; grid.hidden = n === 0;
      sync();
    }
    function clearAll() {
      qEl.value = ''; minEl.value = ''; maxEl.value = ''; avEl.value = ''; sortEl.value = 'featured';
      if (globalMode) catEl.value = '';
      apply();
    }
    ['input', 'change'].forEach(function (ev) { bar.addEventListener(ev, function (e) { if (e.target === catEl && !globalMode) return; apply(); }); });
    bar.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    bar.querySelector('#vpwClear').addEventListener('click', clearAll);
    empty.querySelector('.vpw-clear').addEventListener('click', clearAll);
    catEl.addEventListener('change', function () {
      if (globalMode) return;
      /* on a category page, choosing another category opens that category's page */
      var v = catEl.value; catEl.value = pageCat;
      location.href = v ? (CAT_PAGE[v] || 'search-results.html?category=' + encodeURIComponent(v)) : 'search-results.html';
    });
    apply();
    return { apply: apply, clear: clearAll };
  }

  /* ---------- 4. collection pages ---------- */
  function initCollection() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.products'));
    var grid = grids[0];
    hydrateAll();
    document.querySelectorAll('.product-card').forEach(function (c) { if (c.parentNode) c.parentNode.classList.add('vpw-grid'); });
    if (!grid) return;
    /* some pages (e.g. birds) split one list over several .products sections: merge them so every filter sees every product */
    grids.slice(1).forEach(function (g) {
      Array.prototype.slice.call(g.querySelectorAll(':scope > .product-card')).forEach(function (c) { grid.appendChild(c); });
      if (!g.querySelector('.product-card')) g.parentNode.removeChild(g);
    });
    var gcards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .product-card'));
    if (!gcards.length) return;
    var first = gcards.filter(function (c) { return c._rec && !c._rec._ghost; })[0];
    PAGE_CATEGORY = first ? first._rec.category : (document.body.classList.contains('toy-sub') ? 'Toys' : '');
    gcards.forEach(function (c) { if (c._rec && c._rec._ghost && PAGE_CATEGORY) c._rec.category = PAGE_CATEGORY; });
    /* remove the old price/sort strip; this bar replaces it */
    var old = document.querySelector('.filter-section');
    if (old && old.querySelector('#minPrice, #sortFilter')) old.parentNode.removeChild(old);
    var oldEmpty = document.getElementById('noProducts'); if (oldEmpty) oldEmpty.parentNode.removeChild(oldEmpty);
    mountBar({ grid: grid, pageCategory: PAGE_CATEGORY, items: gcards.map(function (c, i) { return { el: c, rec: c._rec, hay: c._hay, idx: i }; }) });
    /* click anywhere on a card (not a control) opens the right product */
    grid.addEventListener('click', clickCard, true);
  }
  function clickCard(e) {
    var card = e.target.closest && e.target.closest('.product-card'); if (!card || !card._rec) return;
    if (e.target.closest('button, input, select, .wishlist-btn, .delivery-check, img')) return;
    var a = e.target.closest('a'); if (a && a.getAttribute('href') && a.getAttribute('href') !== '#') return;
    e.preventDefault(); e.stopPropagation();
    if (!card._rec._ghost) location.href = productUrl(card._rec.slug);
  }

  /* ---------- 5. global search / browse page ---------- */
  function initGlobal() {
    var grid = document.getElementById('resultsGrid'); if (!grid) return;
    grid.className = 'products vpw-grid vpw-render';
    var items = PRODUCTS.map(function (p, i) {
      var el = document.createElement('div'); el.className = 'product-card';
      el.innerHTML = '<a href="' + productUrl(p.slug) + '"><img src="' + esc((p.images && p.images[0]) || FALLBACK_IMG) + '" alt=""><h2>' + esc(p.name) + '</h2></a><p class="description">' + esc(p.description || p.category) + '</p><p class="price"></p><button>Add to Cart</button>';
      hydrate(el, p);
      grid.appendChild(el);
      return { el: el, rec: p, hay: haystack(p), idx: i };
    });
    var title = document.getElementById('resultsTitle'), sum = document.getElementById('resultsSummary');
    var q = new URLSearchParams(location.search).get('q');
    if (title) title.textContent = q ? 'Search results for “' + q + '”' : 'Shop all products';
    if (sum) sum.style.display = 'none';
    var ctl = mountBar({ grid: grid, globalMode: true, items: items });
    var form = document.getElementById('resultsSearch');
    if (form) { var inp = document.getElementById('resultsInput'); if (inp) { inp.value = q || ''; } form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value.trim(); var qEl = document.getElementById('vpwQ'); qEl.value = v; if (title) title.textContent = v ? 'Search results for “' + v + '”' : 'Shop all products'; ctl.apply(); }); }
    grid.addEventListener('click', clickCard, true);
  }

  /* ---------- 6. cart uses the same numbers ---------- */
  function wrapCart() {
    if (typeof window.addToCart !== 'function' || window.addToCart._vpw) return;
    var orig = window.addToCart;
    window.addToCart = function (name, price, image) {
      var rec = BY_NAME[slugify(cleanName(name))];
      var p = rec ? rec.price : parseNum(price);
      if (rec) {
        if (rec._state === 'out_of_stock') { toast(rec.name + ' is out of stock'); return; }
        if (rec.priceOnRequest || rec.price == null) { toast('Please contact us for the price of ' + rec.name); return; }
        if (!image && rec.images && rec.images[0]) image = rec.images[0];
        name = rec.name;
      }
      if (p == null || isNaN(p)) { toast('Please contact us for the price'); return; }
      return orig.call(this, name, p, image);
    };
    window.addToCart._vpw = true;
  }
  function reconcileCart() {
    try {
      var cart = JSON.parse(localStorage.getItem('cart') || '[]'), changed = false;
      cart.forEach(function (it) {
        var rec = BY_NAME[slugify(cleanName(it.name))];
        var n = rec && rec.price != null ? rec.price : parseNum(it.price);
        if (n != null && it.price !== n) { it.price = n; changed = true; }
      });
      if (changed) localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {}
  }

  /* ---------- go ---------- */
  function boot() {
    wrapCart(); reconcileCart();
    if (document.getElementById('resultsGrid')) initGlobal();
    else if (document.querySelector('.product-card')) initCollection();
    if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
  }
  window.VPW = { _ready: true, products: PRODUCTS, formatINR: formatINR, getProduct: function (s) { return BY_SLUG[s]; }, hydrate: hydrate, slugify: slugify };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
