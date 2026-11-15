/* =========================================================
   VIMAL - HOME PAGE "LIMITED TIME OFFER" POPUP
   - Shows AFTER the welcome popup and the "Download the app" popup are closed.
   - Content comes from js/offers-data.js (the same list that feeds offers.html), so you edit offers in ONE place.
   - Live offer -> "Ends in" countdown.  No live offer but one starts soon -> "Starts in" countdown.
   - Test any time (ignores the once-per-visit rule):  index.html?offerPopup=1
   ========================================================= */
(function () {
    "use strict";

    /* ================= SETTINGS ================= */
    var ENABLED       = true;
    var FREQUENCY     = "always";   // "always" = every home-page load, "session" = once per visit, "day" = once per 24 h
    var UPCOMING_DAYS = 45;         // when nothing is live, announce the next offer if it starts within this many days (0 = only live offers)
    var SHOW_FIRST    = false;      // false = after the other popups (recommended). true = immediately, in front of them
    var OFFERS_PAGE   = "offers.html";
    var SEE_ALL_TEXT  = "🎁 See all offers";
    var LATER_TEXT    = "No thanks";
    /* ============================================ */

    var params = new URLSearchParams(location.search), force = params.get("offerPopup") === "1";
    function why(m) { try { console.info("[Vimal offer popup] not shown: " + m); } catch (e) {} }

    var path = location.pathname.replace(/\/+$/, "");
    var isHome = path === "" || /\/index(\.html)?$/i.test(path);
    if (!isHome && !force) return;
    if (!ENABLED && !force) { why("ENABLED is false"); return; }

    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function two(n) { return n < 10 ? "0" + n : "" + n; }
    function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
    function d(s, endOfDay) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2], endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0); }
    var FMT = { day: "numeric", month: "short" };
    function safeLink(u) { return /^[a-z0-9_\-\/.#?=&]+$/i.test(u || "") ? u : OFFERS_PAGE; }

    /* ---------- which offer to show ---------- */
    function pick() {
        var list = window.VIMAL_OFFERS || [], now = new Date();
        var all = list.map(function (o) { var c = {}; for (var k in o) c[k] = o[k]; c.s = d(o.start); c.e = d(o.end, true); c.state = now > c.e ? "ended" : (now >= c.s ? "live" : "soon"); return c; });
        var live = all.filter(function (o) { return o.state === "live"; }).sort(function (a, b) { return a.e - b.e; });
        if (live.length) return live[0];
        var soon = all.filter(function (o) { return o.state === "soon"; }).sort(function (a, b) { return a.s - b.s; });
        if (soon.length && (force || (UPCOMING_DAYS > 0 && (soon[0].s - now) / 86400000 <= UPCOMING_DAYS))) return soon[0];
        return null;
    }

    /* ---------- remember (frequency) ---------- */
    function store() { try { return window[FREQUENCY === "session" ? "sessionStorage" : "localStorage"]; } catch (e) { return null; } }
    function key(o) { return "vopSeen:" + o.code + ":" + o.state; }
    function seen(o) {
        if (force || FREQUENCY === "always") return false;
        var s = store(), v = s && s.getItem(key(o)); if (!v) return false;
        return FREQUENCY === "session" ? true : (Date.now() - Number(v) < 24 * 3600 * 1000);
    }
    function remember(o) { if (force || FREQUENCY === "always") return; var s = store(); try { s && s.setItem(key(o), String(Date.now())); } catch (e) {} }

    /* ---------- build ---------- */
    function build(o) {
        if (document.getElementById("vopOverlay")) return;
        var live = o.state === "live", target = live ? o.e : o.s;
        var big = o.flat ? money(o.flat) : (o.pct + "%");
        var dealLine = esc(o.deal) + (o.on ? ". On " + esc(o.on) : ". On everything in the store") + ".";
        var terms = "Add items to your cart and apply the code at checkout." + (o.min ? " Minimum order " + money(o.min) + "." : "") + " One use per customer. " +
            (live ? "Valid " : "Valid from ") + d(o.start).toLocaleDateString("en-IN", FMT) + " – " + d(o.end, true).toLocaleDateString("en-IN", FMT) + ".";
        var ov = document.createElement("div");
        ov.id = "vopOverlay"; ov.className = "vop-overlay";
        ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Limited time offer");
        ov.style.setProperty("--c1", o.c1 || "#00b4d8"); ov.style.setProperty("--c2", o.c2 || "#0b2a5b");
        ov.innerHTML =
            '<div class="vop-card">' +
              '<button type="button" class="vop-close" aria-label="Close">✕</button>' +
              '<div class="vop-hero"><span class="vop-ribbon">' + (live ? "LIMITED TIME" : "COMING SOON") + '</span>' +
                '<div class="vop-big">' + esc(big) + '<small>OFF</small></div><div class="vop-pets" aria-hidden="true">' + esc(o.emoji || "🎁") + '</div></div>' +
              '<div class="vop-body">' +
                '<span class="vop-badge">' + (live ? "LIVE NOW · ENDS " + d(o.end, true).toLocaleDateString("en-IN", FMT).toUpperCase() : "STARTS " + d(o.start).toLocaleDateString("en-IN", FMT).toUpperCase()) + '</span>' +
                '<h2 class="vop-title">' + esc(o.name) + '</h2>' +
                '<p class="vop-desc">' + dealLine + '</p>' +
                '<div class="vop-code"><div><small>' + (live ? "USE CODE" : "CODE (WORKS FROM " + d(o.start).toLocaleDateString("en-IN", FMT).toUpperCase() + ")") + '</small><b>' + esc(o.code) + '</b></div><button type="button" class="vop-copy">Copy</button></div>' +
                '<div class="vop-ends">⏳ ' + (live ? "Offer ends in" : "Offer starts in") + '</div>' +
                '<div class="vop-timer" id="vopTimer"><div><b data-u="d">00</b><small>Days</small></div><div><b data-u="h">00</b><small>Hrs</small></div><div><b data-u="m">00</b><small>Min</small></div><div><b data-u="s">00</b><small>Sec</small></div></div>' +
                '<div class="vop-actions"><a class="vop-btn main" href="' + esc(safeLink(o.link)) + '">🛍 Shop this offer</a>' +
                  '<a class="vop-btn alt" href="' + esc(OFFERS_PAGE) + '">' + SEE_ALL_TEXT + '</a></div>' +
                '<p class="vop-terms">' + esc(terms) + '</p>' +
                '<button type="button" class="vop-later">' + LATER_TEXT + '</button>' +
              '</div></div>';
        document.body.appendChild(ov);
        var timer;

        function close() {
            remember(o); clearInterval(timer);
            ov.classList.remove("vop-show"); document.removeEventListener("keydown", onKey);
            setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 400);
        }
        function onKey(e) { if (e.key === "Escape") close(); }
        ov.querySelector(".vop-close").addEventListener("click", close);
        ov.querySelector(".vop-later").addEventListener("click", close);
        ov.querySelectorAll(".vop-btn").forEach(function (b) { b.addEventListener("click", close); });
        ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
        document.addEventListener("keydown", onKey);

        var copy = ov.querySelector(".vop-copy");
        copy.addEventListener("click", function () {
            try { localStorage.setItem("vp_pending_coupon", o.code); } catch (e) {}      /* same as the offers page: cart picks it up */
            function done() { copy.textContent = "Copied ✓"; setTimeout(function () { copy.textContent = "Copy"; }, 1800); }
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(o.code).then(done, done);
            else { var t = document.createElement("textarea"); t.value = o.code; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(); }
        });

        var box = ov.querySelector("#vopTimer");
        function tick() {
            var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
            var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
            for (var k in v) box.querySelector('[data-u="' + k + '"]').textContent = two(v[k]);
            if (s === 0 && live) close();
        }
        tick(); timer = setInterval(tick, 1000);
        requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add("vop-show"); }); });
        ov.querySelector(".vop-btn.main").focus({ preventScroll: true });
    }

    /* ---------- wait for the other popups ---------- */
    function blocked() {
        var w = document.getElementById("offerPopup");       /* welcome popup */
        var welcomeOpen = w && getComputedStyle(w).display !== "none" && getComputedStyle(w).visibility !== "hidden";
        return welcomeOpen || !!document.getElementById("vhpOverlay");   /* app popup */
    }
    function run() {
        var o = pick();
        if (!o) { why("no live offer, and none starting within " + UPCOMING_DAYS + " days. Add or change dates in js/offers-data.js"); return; }
        if (seen(o)) { why("already shown (" + FREQUENCY + "). Use ?offerPopup=1 to preview."); return; }
        if (SHOW_FIRST) { setTimeout(function () { build(o); }, 700); return; }
        var quiet = 0, waited = 0;
        var iv = setInterval(function () {
            waited += 500; quiet = blocked() ? 0 : quiet + 500;
            if (quiet >= 1500 || waited > 120000) { clearInterval(iv); if (!blocked()) build(pick() || o); }
        }, 500);
    }
    function start() {
        if (window.VIMAL_OFFERS) return run();
        var s = document.createElement("script"); s.src = "js/offers-data.js?v=1";
        s.onload = run; s.onerror = function () { why("could not load js/offers-data.js"); };
        document.head.appendChild(s);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
