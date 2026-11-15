/* =========================================================
   VIMAL - HOME PAGE "OFFER" POPUP
   Add ONLY to index.html. Self-contained (injects its own HTML).
   Waits until the welcome popup and the app popup are closed, so they never stack.
   Test any time with:  index.html?offerPopup=1
   ========================================================= */
(function () {
    "use strict";

    /* ================= EDIT HERE (sample content: replace with your real offer) ================= */
    var OFFER = {
        enabled: true,                          // false = never show
        start:   "2026-11-01T00:00:00+05:30",   // optional: not shown before this
        end:     "2026-12-31T23:59:59+05:30",   // optional: auto-hides after this, and drives the countdown
        ribbon:  "LIMITED OFFER",
        big:     "20%",                         // the big number on the left
        bigSub:  "OFF",
        emoji:   "🐶 🐠 🧸",
        badge:   "SPECIAL OFFER",
        title:   "Festive Pet &amp; Toy <span>Sale</span>",
        desc:    "Save on pet food, aquarium needs, accessories and toys. Use the code below.",
        code:    "VIMAL20",                     // leave "" for no code box
        terms:   "Valid on selected items while the offer lasts. Show the code in store or quote it on WhatsApp.",
        ctaText: "Shop the sale",
        ctaUrl:  "#best-sellers",               // page link or #section on the home page
        whatsapp: "917845452727",               // digits only with 91; "" hides the WhatsApp button
        waText:  "Hi! I'd like to use offer code {code}.",
        laterText: "No thanks",
        showTimer: true                         // countdown to "end"
    };
    var FREQUENCY  = "day";   // "session" = once per visit, "day" = once every 24 h, "always" = every page load
    var DELAY_MS   = 1000;    // wait after the other popups are closed
    /* ========================================================================================= */

    var params = new URLSearchParams(location.search), force = params.get("offerPopup") === "1";
    var path = location.pathname.replace(/\/+$/, "");
    var isHome = path === "" || /\/index(\.html)?$/i.test(path);
    if (!isHome && !force) return;
    if (!OFFER.enabled && !force) return;

    var now = Date.now(), t0 = OFFER.start ? Date.parse(OFFER.start) : NaN, t1 = OFFER.end ? Date.parse(OFFER.end) : NaN;
    if (!force && ((!isNaN(t0) && now < t0) || (!isNaN(t1) && now > t1))) return;

    var KEY = "vopSeen:" + (OFFER.code || OFFER.big) + ":" + (OFFER.end || "");
    function store(kind) { try { return window[kind]; } catch (e) { return null; } }
    function seen() {
        if (force || FREQUENCY === "always") return false;
        var s = store(FREQUENCY === "session" ? "sessionStorage" : "localStorage"); if (!s) return false;
        var v = s.getItem(KEY); if (!v) return false;
        return FREQUENCY === "session" ? true : (now - Number(v) < 24 * 3600 * 1000);
    }
    function remember() {
        if (FREQUENCY === "always") return;
        var s = store(FREQUENCY === "session" ? "sessionStorage" : "localStorage"); try { s && s.setItem(KEY, String(Date.now())); } catch (e) {}
    }
    if (seen()) return;

    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function two(n) { return n < 10 ? "0" + n : "" + n; }

    function build() {
        if (document.getElementById("vopOverlay")) return;
        var hasTimer = OFFER.showTimer && !isNaN(t1) && t1 > Date.now();
        var o = document.createElement("div");
        o.id = "vopOverlay"; o.className = "vop-overlay";
        o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Special offer");
        var wa = OFFER.whatsapp ? "https://wa.me/" + String(OFFER.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(OFFER.waText.replace("{code}", OFFER.code || "")) : "";
        o.innerHTML =
            '<div class="vop-card">' +
              '<button type="button" class="vop-close" aria-label="Close">✕</button>' +
              '<div class="vop-hero"><span class="vop-ribbon">' + OFFER.ribbon + '</span>' +
                '<div class="vop-big">' + OFFER.big + '<small>' + OFFER.bigSub + '</small></div><div class="vop-pets" aria-hidden="true">' + OFFER.emoji + '</div></div>' +
              '<div class="vop-body">' +
                '<span class="vop-badge">' + OFFER.badge + '</span>' +
                '<h2 class="vop-title">' + OFFER.title + '</h2>' +
                '<p class="vop-desc">' + OFFER.desc + '</p>' +
                (OFFER.code ? '<div class="vop-code"><div><small>USE CODE</small><b>' + esc(OFFER.code) + '</b></div><button type="button" class="vop-copy">Copy</button></div>' : '') +
                (hasTimer ? '<div class="vop-ends">⏳ Offer ends in</div><div class="vop-timer" id="vopTimer"><div><b data-u="d">00</b><small>Days</small></div><div><b data-u="h">00</b><small>Hrs</small></div><div><b data-u="m">00</b><small>Min</small></div><div><b data-u="s">00</b><small>Sec</small></div></div>' : '') +
                '<div class="vop-actions"><a class="vop-btn main" href="' + esc(OFFER.ctaUrl) + '">🛍 ' + OFFER.ctaText + '</a>' +
                  (wa ? '<a class="vop-btn wa" href="' + esc(wa) + '" target="_blank" rel="noopener">💬 Claim on WhatsApp</a>' : '') + '</div>' +
                (OFFER.terms ? '<p class="vop-terms">' + OFFER.terms + '</p>' : '') +
                '<button type="button" class="vop-later">' + OFFER.laterText + '</button>' +
              '</div></div>';
        document.body.appendChild(o);
        var prev = document.body.style.overflow; document.body.style.overflow = "hidden";
        var timer = null;

        function close() {
            remember(); clearInterval(timer);
            o.classList.remove("vop-show"); document.body.style.overflow = prev;
            document.removeEventListener("keydown", onKey);
            setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 400);
        }
        function onKey(e) { if (e.key === "Escape") close(); }
        o.querySelector(".vop-close").addEventListener("click", close);
        o.querySelector(".vop-later").addEventListener("click", close);
        o.querySelectorAll(".vop-btn").forEach(function (b) { b.addEventListener("click", close); });
        o.addEventListener("click", function (e) { if (e.target === o) close(); });
        document.addEventListener("keydown", onKey);

        var copy = o.querySelector(".vop-copy");
        if (copy) copy.addEventListener("click", function () {
            function done() { copy.textContent = "Copied ✓"; setTimeout(function () { copy.textContent = "Copy"; }, 1800); }
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(OFFER.code).then(done, done);
            else { var t = document.createElement("textarea"); t.value = OFFER.code; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(); }
        });

        if (hasTimer) {
            var box = o.querySelector("#vopTimer");
            var tick = function () {
                var s = Math.max(0, Math.floor((t1 - Date.now()) / 1000));
                if (s === 0) { close(); return; }
                var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
                for (var k in v) box.querySelector('[data-u="' + k + '"]').textContent = two(v[k]);
            };
            tick(); timer = setInterval(tick, 1000);
        }
        requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add("vop-show"); }); });
        o.querySelector(".vop-btn.main").focus({ preventScroll: true });
    }

    /* Never stack with the welcome popup (#offerPopup) or the app popup (#vhpOverlay):
       show ours only after both have been closed for ~1.5 seconds. */
    function blocked() {
        var w = document.getElementById("offerPopup");
        var welcomeOpen = w && getComputedStyle(w).display !== "none" && getComputedStyle(w).visibility !== "hidden";
        return welcomeOpen || !!document.getElementById("vhpOverlay");
    }
    function start() {
        var quiet = 0, waited = 0;
        var iv = setInterval(function () {
            waited += 500;
            quiet = blocked() ? 0 : quiet + 500;
            if (quiet >= 1500 + DELAY_MS - 1000 || waited > 90000) { clearInterval(iv); if (!blocked()) build(); }
        }, 500);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
