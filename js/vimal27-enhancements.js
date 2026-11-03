/* ============================================================
   VIMAL27 ADD-ON ENHANCEMENTS
   Additive JS layer. Existing functions remain intact.
   ============================================================ */
(function () {
  'use strict';

  const ROOT = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = ROOT === '' || ROOT.toLowerCase() === 'index.html';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function addSkipLink() {
    if (document.querySelector('.v27-skip-link')) return;

    const main = document.querySelector('main') ||
      document.querySelector('#main') ||
      document.querySelector('section');

    if (!main) return;
    if (!main.id) main.id = 'vimal-main-content';

    const link = document.createElement('a');
    link.className = 'v27-skip-link';
    link.href = '#' + main.id;
    link.textContent = 'Skip to content';
    document.body.prepend(link);
  }

  function addBreadcrumb() {
    if (
      isHome ||
      document.querySelector('.v27-breadcrumb') ||
      document.body.classList.contains('no-breadcrumb')
    ) return;

    const nav = document.querySelector('nav.navbar');
    if (!nav) return;

    const path = ROOT.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
    if (!path || path.toLowerCase() === 'index') return;

    const label = path.replace(/\b\w/g, function (match) {
      return match.toUpperCase();
    });

    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'v27-breadcrumb';

    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';

    const separator = document.createElement('span');
    separator.textContent = '  ›  ';

    const current = document.createElement('span');
    current.textContent = escapeHtml(label);

    breadcrumb.append(homeLink, separator, current);
    nav.insertAdjacentElement('afterend', breadcrumb);
  }

  function addQuickShop() {
    if (!isHome || document.querySelector('.v27-quick-shop')) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const wrap = document.createElement('section');
    wrap.className = 'v27-quick-shop';
    wrap.setAttribute('aria-label', 'Quick shopping links');

    wrap.innerHTML = `
      <div class="v27-quick-shop-inner">
        <a href="toys.html"><span>🧸</span><span>Toys<small>Explore all toys</small></span></a>
        <a href="dogs.html"><span>🐶</span><span>Dogs &amp; Cats<small>Find your pet</small></span></a>
        <a href="fish.html"><span>🐠</span><span>Fish &amp; Aquariums<small>Fish, tanks &amp; care</small></span></a>
        <a href="foods.html"><span>🥣</span><span>Pet Food<small>Everyday essentials</small></span></a>
      </div>
    `;

    hero.insertAdjacentElement('afterend', wrap);
  }

  function addTopButton() {
    if (document.querySelector('.v27-top')) return;

    const button = document.createElement('button');
    button.className = 'v27-top';
    button.type = 'button';
    button.textContent = '↑';
    button.setAttribute('aria-label', 'Back to top');

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    const sync = function () {
      button.classList.toggle('show', window.scrollY > 500);
    };

    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  function improveImages() {
    document.querySelectorAll('img').forEach(function (img, index) {
      if (!img.hasAttribute('loading') && index > 2) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  function improveA11y() {
    document.querySelectorAll('.dropdown > a').forEach(function (link) {
      if (!link.hasAttribute('aria-haspopup')) {
        link.setAttribute('aria-haspopup', 'true');
      }
      if (!link.hasAttribute('aria-expanded')) {
        link.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (event) {
      const target = event.target instanceof Element ? event.target : null;
      const link = target ? target.closest('.dropdown > a') : null;

      if (link) {
        const expanded = link.getAttribute('aria-expanded') === 'true';
        link.setAttribute('aria-expanded', String(!expanded));
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && typeof window.closeMenu === 'function') {
        window.closeMenu();
      }
    });
  }

  function syncCounts() {
    try {
      let cartCount = 0;
      const raw = localStorage.getItem('cart');

      if (raw) {
        const data = JSON.parse(raw);

        if (Array.isArray(data)) {
          cartCount = data.reduce(function (total, item) {
            return total + (Number(item.quantity) || Number(item.qty) || 1);
          }, 0);
        } else if (data && typeof data === 'object') {
          cartCount = Number(data.count) || 0;
        }
      }

      document.querySelectorAll('#cartCount').forEach(function (element) {
        element.textContent = String(cartCount);
      });
    } catch (error) {
      // Leave the existing cart display unchanged if stored data is invalid.
    }
  }

  function addSearchEnhancement() {
    const input = document.getElementById('searchInput');
    if (!input || input.dataset.v27Enhanced) return;

    input.dataset.v27Enhanced = '1';
    input.setAttribute('aria-autocomplete', 'list');

    input.addEventListener('input', function () {
      const query = input.value.trim().toLowerCase();
      let box = document.getElementById('v27-search-suggestions');

      if (!box) {
        box = document.createElement('div');
        box.id = 'v27-search-suggestions';
        box.style.cssText =
          'position:fixed;z-index:100001;background:#fff;border:1px solid #e5eaf0;' +
          'border-radius:10px;box-shadow:0 12px 30px rgba(7,26,61,.16);' +
          'display:none;overflow:hidden;';
        document.body.appendChild(box);
      }

      if (!query) {
        box.style.display = 'none';
        return;
      }

      const items = [
        ['Toys', 'toys.html', '🧸'],
        ['Dogs', 'dogs.html', '🐶'],
        ['Cats', 'cats.html', '🐱'],
        ['Fish', 'fish.html', '🐠'],
        ['Birds', 'birds.html', '🦜'],
        ['Small Pets', 'small-pets.html', '🐹'],
        ['Pet Food', 'foods.html', '🥣'],
        ['Accessories', 'accessories.html', '🎯'],
        ['Aquariums', 'aquariums.html', '🐟'],
        ['Pet Care Guide', 'care-guide.html', '📚']
      ].filter(function (item) {
        return item[0].toLowerCase().includes(query);
      }).slice(0, 6);

      if (!items.length) {
        box.style.display = 'none';
        return;
      }

      box.innerHTML = items.map(function (item) {
        return `<a href="${item[1]}" style="display:block;padding:11px 14px;` +
          `text-decoration:none;color:#122033;font-size:13px;` +
          `border-bottom:1px solid #eef2f5">${item[2]}&nbsp; ${item[0]}</a>`;
      }).join('');

      const rect = input.getBoundingClientRect();
      box.style.left = rect.left + 'px';
      box.style.top = (rect.bottom + 6) + 'px';
      box.style.width = Math.min(rect.width, 360) + 'px';
      box.style.display = 'block';
    });

    document.addEventListener('click', function (event) {
      const box = document.getElementById('v27-search-suggestions');
      const target = event.target instanceof Element ? event.target : null;

      if (
        box &&
        target &&
        !target.closest('#searchInput') &&
        !target.closest('#v27-search-suggestions')
      ) {
        box.style.display = 'none';
      }
    });
  }

  function fixMobileBodyLayout() {
    if (window.innerWidth > 900) return;

    document.querySelectorAll('body > nav.navbar').forEach(function (nav) {
      nav.style.flex = '0 0 auto';
    });

    document.querySelectorAll(
      'body > section, body > main, body > .wishlist-wrap, ' +
      'body > .cart-section, body > .dashboard-wrap, body > footer'
    ).forEach(function (element) {
      element.style.maxWidth = '100%';
      element.style.minWidth = '0';
    });
  }

  // ---------- Vimal27 branded mouse cursor ----------
  function addVimalLogoCursor() {
    // Keep normal touch behaviour on phones and tablets.
    if (
      !window.matchMedia ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    if (document.getElementById('v27-logo-cursor')) return;

    const cursor = document.createElement('img');
    cursor.id = 'v27-logo-cursor';
    cursor.alt = '';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.draggable = false;

    // The logo must NEVER intercept clicks intended for page controls.
    cursor.style.pointerEvents = 'none';
    cursor.style.userSelect = 'none';
    cursor.style.webkitUserDrag = 'none';

    cursor.onload = function () {
      if (!cursor.isConnected) {
        document.body.appendChild(cursor);
      }

      // Hide the normal arrow only after the image has loaded.
      document.documentElement.classList.add('v27-logo-cursor');
    };

    cursor.onerror = function () {
      cursor.remove();
      document.documentElement.classList.remove('v27-logo-cursor');
      console.error('Vimal27 cursor logo failed to load:', cursor.src);
    };

    // Set the source after the load/error handlers are ready.
    cursor.src = '/icon.png';

    document.body.appendChild(cursor);

    document.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;

      cursor.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

      cursor.classList.add('v27-cursor-visible');

      const target = event.target instanceof Element ? event.target : null;
      const isInteractive = target && target.closest(
        'a, button, [role="button"], summary, label, select, input, textarea'
      );

      cursor.classList.toggle('v27-cursor-link', Boolean(isInteractive));
    }, { passive: true });

    document.addEventListener('pointerout', function (event) {
      if (event.relatedTarget === null) {
        cursor.classList.remove('v27-cursor-visible');
      }
    });

    window.addEventListener('blur', function () {
      cursor.classList.remove('v27-cursor-visible');
    });
  }

  ready(function () {
    document.documentElement.dataset.vimal27Enhanced = 'true';

    addSkipLink();
    addBreadcrumb();
    addQuickShop();
    addTopButton();
    improveImages();
    improveA11y();
    syncCounts();
    addSearchEnhancement();
    fixMobileBodyLayout();
    addVimalLogoCursor();

    window.addEventListener('resize', fixMobileBodyLayout, { passive: true });

    window.setTimeout(addSearchEnhancement, 700);
  });
})();
