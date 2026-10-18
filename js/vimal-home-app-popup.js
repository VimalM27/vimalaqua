/* =========================================================
   VIMAL - HOME PAGE "DOWNLOAD THE APP" POPUP
   Add ONLY to index.html (see INSTALL.txt).
   Self-contained: injects its own HTML. No other files edited.
   ========================================================= */
(function () {
    "use strict";

    /* ================= EDIT HERE ================= */
    var APP_URL = "https://play.google.com/store/apps/details?id=com.vimal27.petsworld"; // your Play Store (or .apk) link
    var TEXT = {
        badge:  "NEW · ANDROID APP",
        title:  "Shop pets &amp; toys<br><span>right from your phone</span>",
        desc:   "Get the Vimal Pets &amp; Toys app for faster browsing, app-only offers and easy order updates.",
        points: ["Pets, foods, aquariums &amp; toys in a few taps",
                 "App-only deals and offers",
                 "Opens full-screen, no browser bar"],
        button: "Download the App",
        note:   "Free • Quick install • Made in Coimbatore",
        later:  "Maybe later"
    };
    var DELAY_MS    = 1200;  // wait after page / welcome popup before showing
    var SHOW_ON_IOS = true;  // show to everyone (set false to hide on iPhone/iPad)
    /* ============================================= */

    var params = new URLSearchParams(location.search);
    var force = params.get("appPopup") === "1";           // test: index.html?appPopup=1

    // Home page only
    var path = location.pathname.replace(/\/+$/, "");
    var isHome = path === "" || /\/index(\.html)?$/i.test(path);
    if (!isHome && !force) return;

    // Not for people already inside the installed app
    var inApp = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) ||
                (document.referrer || "").indexOf("android-app://") === 0;
    if (inApp && !force) return;

    // Not for iPhone/iPad (no iOS app)
    if (!SHOW_ON_IOS && /iPhone|iPad|iPod/i.test(navigator.userAgent) && !force) return;

    // Hide the older site-wide popup (navbar.js) on the home page so two don't stack
    if (typeof window.showAppPopup === "function") { window.showAppPopup = function () {}; }

    // NOTE: popup now shows on EVERY home-page load/refresh (no "hide for X days" memory)

    var PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 2.6v18.8c0 .5.5.8.9.5l15-9.4c.4-.2.4-.8 0-1L5.9 2.1c-.4-.3-.9 0-.9.5z"/></svg>';

    function build() {
        if (document.getElementById("vhpOverlay")) return;
        var pts = TEXT.points.map(function (p) { return "<li>" + p + "</li>"; }).join("");
        var o = document.createElement("div");
        o.id = "vhpOverlay";
        o.className = "vhp-overlay";
        o.setAttribute("role", "dialog");
        o.setAttribute("aria-modal", "true");
        o.setAttribute("aria-label", "Download the Vimal Pets and Toys app");
        o.innerHTML =
            '<div class="vhp-card">' +
              '<button type="button" class="vhp-close" aria-label="Close">✕</button>' +
              '<div class="vhp-photo" role="img" aria-label="A boy and girl with a friendly phoenix in a playground">' +
                '<div class="vhp-phone" aria-hidden="true">' +
                  '<div class="vhp-notch"></div>' +
                  '<div class="vhp-screen">' +
                    '<div class="vhp-app-head"><img src="images/vimallogo.png?v=2" alt=""></div>' +
                    '<div class="vhp-app-search"></div>' +
                    '<div class="vhp-app-banner"></div>' +
                    '<div class="vhp-app-tiles"><i>🐶</i><i>🐠</i><i>🧸</i><i>🍖</i></div>' +
                    '<div class="vhp-app-nav"><span>🏠</span><span>♡</span><span>🛒</span><span>👤</span></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="vhp-body">' +
                '<span class="vhp-badge">' + TEXT.badge + '</span>' +
                '<h2 class="vhp-title">' + TEXT.title + '</h2>' +
                '<p class="vhp-desc">' + TEXT.desc + '</p>' +
                '<ul class="vhp-points">' + pts + '</ul>' +
                '<a class="vhp-btn" href="' + APP_URL + '" target="_blank" rel="noopener">' + PLAY_ICON + '<span>' + TEXT.button + '</span></a>' +
                '<small class="vhp-note">' + TEXT.note + '</small>' +
                '<button type="button" class="vhp-later">' + TEXT.later + '</button>' +
              '</div>' +
            '</div>';
        document.body.appendChild(o);

        var prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function close(remember) {
            o.classList.remove("vhp-show");
            document.body.style.overflow = prevOverflow;
            document.removeEventListener("keydown", onKey);
            setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 400);
        }
        function onKey(e) { if (e.key === "Escape") close(true); }

        o.querySelector(".vhp-close").addEventListener("click", function () { close(true); });
        o.querySelector(".vhp-later").addEventListener("click", function () { close(true); });
        o.querySelector(".vhp-btn").addEventListener("click", function () { close(true); });
        o.addEventListener("click", function (e) { if (e.target === o) close(true); });
        document.addEventListener("keydown", onKey);

        requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add("vhp-show"); }); });
        o.querySelector(".vhp-btn").focus({ preventScroll: true });
    }

    // Wait until the welcome/offer popup (if any) is closed, then show ours
    function whenReady() {
        var welcome = document.getElementById("offerPopup");
        function welcomeOpen() { return welcome && getComputedStyle(welcome).display !== "none"; }
        if (!welcomeOpen()) { setTimeout(build, DELAY_MS); return; }
        var mo = new MutationObserver(function () {
            if (!welcomeOpen()) { mo.disconnect(); setTimeout(build, DELAY_MS); }
        });
        mo.observe(welcome, { attributes: true, attributeFilter: ["style", "class"] });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", whenReady);
    else whenReady();
})();
