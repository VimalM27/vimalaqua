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

  /* ------------------------------------------------------------
     GOLDEN SPARK TRAIL for the V cursor
     Desktop / mouse only. Skipped for touch and reduced-motion.
     ------------------------------------------------------------ */
  function addSparkTrail() {
    if (document.getElementById('v27-spark-canvas')) return;
    if (!window.matchMedia) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'v27-spark-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
      'pointer-events:none;z-index:2147483646;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Golden palette taken from the V cursor image
    const COLORS = [
      [255, 236, 150],
      [238, 203, 85],
      [222, 178, 80],
      [255, 170, 50]
    ];
    const MAX_PARTICLES = 220;
    const particles = [];
    let running = false;
    let lastX = null;
    let lastY = null;
    let carry = 0;

    function spawn(x, y, vx, vy, burst) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = (burst ? 1.5 + Math.random() * 3.2 : Math.random() * 1.2);
      particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: vx * 0.12 + Math.cos(angle) * speed,
        vy: vy * 0.12 + Math.sin(angle) * speed - 0.2,
        life: 0,
        max: (burst ? 38 : 24) + Math.random() * 20,
        size: (burst ? 1.6 : 1.1) + Math.random() * 1.8,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        star: Math.random() < 0.35
      });
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }

    function drawStar(x, y, r) {
      // small 4-point twinkle
      ctx.beginPath();
      ctx.moveTo(x, y - r * 2);
      ctx.quadraticCurveTo(x, y, x + r * 2, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 2);
      ctx.quadraticCurveTo(x, y, x - r * 2, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 2);
      ctx.fill();
    }

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.max) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.045; // slight gravity, sparks drift down
        p.x += p.vx;
        p.y += p.vy;

        const t = p.life / p.max;
        const alpha = (1 - t) * (1 - t);
        const size = p.size * (1 - t * 0.6);
        const c = p.color;

        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha.toFixed(3) + ')';
        if (p.star) {
          drawStar(p.x, p.y, size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      if (particles.length) {
        requestAnimationFrame(tick);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    document.addEventListener('mousemove', function (event) {
      const x = event.clientX;
      const y = event.clientY;

      if (lastX !== null) {
        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        carry += dist;
        // one spark roughly every 7px of travel, so fast moves leave more
        while (carry >= 7) {
          carry -= 7;
          const k = Math.random();
          spawn(lastX + dx * k, lastY + dy * k, dx, dy, false);
        }
        if (particles.length) start();
      }

      lastX = x;
      lastY = y;
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      lastX = null;
      lastY = null;
    });

    // small burst on click
    document.addEventListener('mousedown', function (event) {
      for (let i = 0; i < 14; i++) {
        spawn(event.clientX, event.clientY, 0, 0, true);
      }
      start();
    }, { passive: true });
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
    addSparkTrail();

    window.addEventListener('resize', fixMobileBodyLayout, { passive: true });

    window.setTimeout(addSearchEnhancement, 700);
  });
})();
