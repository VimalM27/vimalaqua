// ============================================================
// VIMAL PETS & TOYS - UNIVERSAL NAVBAR
// Desktop + Mobile
// ============================================================


// ============================================================
// MOBILE MENU
// ============================================================
// ================= MOBILE MENU =================

function openMenu() {

    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenu) {
        mobileMenu.classList.add("active");
    }
}


function closeMenu() {

    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenu) {
        mobileMenu.classList.remove("active");
    }

}


// ============================================================
// UNIVERSAL NAVBAR
// ============================================================

function applyUnifiedNavbar() {

    const nav =
        document.querySelector("nav.navbar");

    if (!nav) return;


    // ========================================================
    // DESKTOP / MAIN NAVBAR
    // ========================================================

    nav.innerHTML = `
        <!-- ==================================================
             MAIN HEADER
        =================================================== -->

        <div class="vimal-main-header">


            <!-- MOBILE MENU BUTTON -->

            <button
                type="button"
                class="mobile-menu-btn"
                onclick="openMenu()"
                aria-label="Open Menu">

                ☰

            </button>


            <!-- LOGO -->

            <div class="logo">

                <a
                    href="index.html"
                    class="logo-link">

                    <img
                        src="images/vimallogo.png?v=2"
                        alt="Vimal Pets & Toys"
                        class="navbar-logo">

                </a>

            </div>


            <!-- SEARCH -->

            <form
                class="search-box"
                onsubmit="searchWebsite(event)">

                <input
                    type="search"
                    id="searchInput"
                    placeholder="Search pets, foods, accessories..."
                    autocomplete="off"
                    aria-label="Search">

                <button
                    type="submit"
                    aria-label="Search">

                    🔍

                </button>

            </form>


            <!-- HEADER ACTIONS -->

            <div class="vimal-header-actions">


                <!-- PARTNER ACCOUNT -->

                <a
                    href="seller-login.html"
                    class="vimal-header-action">

                    <span class="action-icon">
                        👤
                    </span>

                    <span class="action-text">
                        Partner Account
                    </span>

                </a>


                <!-- WISHLIST -->

                <a
                    href="wishlist.html"
                    class="vimal-header-action wishlist-header-link">

                    <span class="action-icon">
                        ♡
                    </span>

                    <span class="action-text">
                        Wishlist
                    </span>

                    <span
                        class="header-count"
                        id="wishlistCount">

                        0

                    </span>

                </a>


                <!-- CART -->

                <a
                    href="cart.html"
                    class="vimal-header-action cart-header-link">

                    <span class="action-icon">
                        🛒
                    </span>

                    <span class="action-text">
                        Cart
                    </span>

                    <span
                        class="header-count"
                        id="cartCount">

                        0

                    </span>

                </a>
                <!-- LANGUAGE -->
<select class="lang-select notranslate" aria-label="Choose language">
    <option value="en">🌐 English</option>
    <option value="ta">தமிழ்</option>
    <option value="hi">हिन्दी</option>
    <option value="te">తెలుగు</option>
    <option value="ml">മലയാളം</option>
    <option value="kn">ಕನ್ನಡ</option>
    <option value="mr">मराठी</option>
    <option value="bn">বাংলা</option>
    <option value="gu">ગુજરાતી</option>
    <option value="pa">ਪੰਜਾਬੀ</option>
</select>

            </div>

        </div>


        <!-- ==================================================
             EXISTING NAVIGATION
        =================================================== -->

        <div class="vimal-navigation">

            <ul class="nav-links">


                <!-- HOME -->

                <li>

                    <a href="index.html">
                        Home
                    </a>

                </li>


                <!-- ==================================================
                     TOYS
                =================================================== -->

                <li class="dropdown">

                    <a
                        href="toys.html"
                        onclick="toggleDropdown(event,this)">

                        Toys ▼

                    </a>


                    <div class="mega-menu">


                        <!-- KIDS -->

                        <div class="menu-column">

                            <h4>
                                Kids &amp; Young
                            </h4>


                            <a href="toys.html#kids-toys">
                                🧒 Kids Toys
                            </a>


                            <a href="toys.html#baby-toddler">
                                👶 Baby &amp; Toddler
                            </a>


                            <a href="toys.html#teens">
                                🎮 Teens
                            </a>


                            <a href="toys.html#adults-hobbies">
                                🧑 Adults &amp; Hobbies
                            </a>


                            <a href="toys.html#seniors">
                                👵 Seniors
                            </a>

                        </div>


                        <!-- LEARNING -->

                        <div class="menu-column">

                            <h4>
                                Learning &amp; Creativity
                            </h4>


                            <a href="toys.html#art-creativity">
                                🎨 Art &amp; Creativity
                            </a>


                            <a href="toys.html#educational-stem">
                                🧠 Educational &amp; STEM
                            </a>


                            <a href="toys.html#unique-trending">
                                ✨ Unique &amp; Trending
                            </a>

                        </div>


                        <!-- FUN -->

                        <div class="menu-column">

                            <h4>
                                Fun &amp; Games
                            </h4>


                            <a href="toys.html#outdoor-sports">
                                ⚽ Outdoor &amp; Sports
                            </a>


                            <a href="toys.html#family-games">
                                👨‍👩‍👧 Family &amp; Group Games
                            </a>


                            <a href="toys.html#pet-toys">
                                🐾 Pet Toys
                            </a>


                            <a
                                href="toys.html"
                                class="view-all-toys">

                                🧸 View All Toys →

                            </a>

                        </div>

                    </div>

                </li>


                <!-- ==================================================
                     PETS & ACCESSORIES
                =================================================== -->

                <li class="dropdown">

                    <a
                        href="#"
                        onclick="toggleDropdown(event,this)">

                        Pets &amp; Accessories ▼

                    </a>


                    <div class="mega-menu">


                        <!-- PETS -->

                        <div class="menu-column">

                            <h4>
                                Pets
                            </h4>


                            <a href="dogs.html">
                                🐶 Dogs
                            </a>


                            <a href="cats.html">
                                🐱 Cats
                            </a>


                            <a href="fish.html">
                                🐟 Fish
                            </a>

                        </div>


                        <!-- PRODUCTS -->

                        <div class="menu-column">

                            <h4>
                                Products
                            </h4>


                            <a href="foods.html">
                                🍖 Pet Foods
                            </a>


                            <a href="accessories.html">
                                🎯 Accessories
                            </a>


                            <a href="aquariums.html">
                                🐠 Aquariums
                            </a>

                        </div>


                        <!-- EXPLORE -->

                        <div class="menu-column">

                            <h4>
                                Explore
                            </h4>


                            <a href="index.html#shop-by-category">
                                🗂 Shop By Category
                            </a>


                            <a href="index.html#best-sellers">
                                🔥 Best Sellers
                            </a>


                            <a href="index.html#new-arrivals-home">
                                🆕 New Arrivals
                            </a>


                            <a href="index.html#pet-care">
                                🩺 Pet Care &amp; Grooming
                            </a>


                            <a href="index.html#aquarium-services">
                                🐠 Aquarium Services
                            </a>


                            <a href="care-guide.html">
                                📚 Pet Care Guide
                            </a>

                        </div>

                    </div>

                </li>


                <!-- ==================================================
                     BECOME A PARTNER
                =================================================== -->

                <li class="dropdown">

                    <a
                        href="#"
                        onclick="toggleDropdown(event,this)">

                        Become a Partner ▼

                    </a>


                    <div class="dropdown-content">


                        <a href="seller-signup.html">
                            📝 Partner Signup
                        </a>


                        <a href="seller-login.html">
                            🔑 Partner Login
                        </a>


                        <a href="seller-dashboard.html">
                            📊 Partner Dashboard
                        </a>


                        <a href="marketplace.html">
                            🛍 Marketplace
                        </a>

                    </div>

                </li>


                <!-- ABOUT -->

                <li>

                    <a href="about.html">
                        About
                    </a>

                </li>


                <!-- CONTACT -->

                <li>

                    <a href="contact.html">
                        Contact
                    </a>

                </li>

            </ul>

        </div>

    `;


    // ========================================================
    // MOBILE MENU
    // ========================================================

    let mobileMenu =
        document.getElementById("mobileMenu");


    if (!mobileMenu) {

        mobileMenu =
            document.createElement("div");

        mobileMenu.id =
            "mobileMenu";

        mobileMenu.className =
            "mobile-menu";

        document.body.appendChild(
            mobileMenu
        );

    }


    mobileMenu.innerHTML = `

    <div class="mobile-menu-header">
        <span>Vimal Pets & Toys</span>
        <button onclick="closeMenu()">✕</button>
    </div>

    <div style="padding:10px 16px;">
    <select class="lang-select notranslate" aria-label="Choose language">
        <option value="en">🌐 English</option>
        <option value="ta">தமிழ்</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
        <option value="ml">മലയാളം</option>
        <option value="kn">ಕನ್ನಡ</option>
        <option value="mr">मराठी</option>
        <option value="bn">বাংলা</option>
        <option value="gu">ગુજરાતી</option>
        <option value="pa">ਪੰਜਾਬੀ</option>
    </select>
</div>
    <!-- HOME -->
    <a href="index.html" class="mobile-main-link">
        🏠 <span>Home</span>
    </a>


    <!-- TOYS -->
    <div class="mobile-dropdown">

        <button
            class="mobile-dropdown-title"
            onclick="toggleMobileDropdown(this)"
        >
            🧸 <span>Toys</span>
            <b>›</b>
        </button>

        <div class="mobile-submenu">

            <a href="toys.html">🧸 All Toys</a>

            <a href="toys.html#kids-toys">
                🧒 Kids Toys
            </a>

            <a href="toys.html#baby-toddler">
                👶 Baby & Toddler
            </a>

            <a href="toys.html#teens">
                🎮 Teens
            </a>

            <a href="toys.html#adults-hobbies">
                🧑 Adults & Hobbies
            </a>

            <a href="toys.html#seniors">
                👵 Seniors
            </a>

            <a href="toys.html#art-creativity">
                🎨 Art & Creativity
            </a>

            <a href="toys.html#educational-stem">
                🧠 Educational & STEM
            </a>

            <a href="toys.html#unique-trending">
                ✨ Unique & Trending
            </a>

            <a href="toys.html#outdoor-sports">
                ⚽ Outdoor & Sports
            </a>

            <a href="toys.html#family-games">
                👨‍👩‍👧 Family & Group Games
            </a>

            <a href="toys.html#pet-toys">
                🐾 Pet Toys
            </a>

        </div>

    </div>


    <!-- PETS & ACCESSORIES -->
    <div class="mobile-dropdown">

        <button
            class="mobile-dropdown-title"
            onclick="toggleMobileDropdown(this)"
        >
            🐶 <span>Pets & Accessories</span>
            <b>›</b>
        </button>

        <div class="mobile-submenu">

            <a href="dogs.html">🐶 Dogs</a>

            <a href="cats.html">🐱 Cats</a>

            <a href="birds.html">🦜 Birds</a>

            <a href="fish.html">🐟 Fish</a>

            <a href="small-pets.html">🐹 Small Pets</a>

            <a href="foods.html">🍖 Pet Foods</a>

            <a href="accessories.html">🎯 Accessories</a>

            <a href="aquariums.html">🐠 Aquariums</a>

            <a href="index.html#shop-by-category">
                🗂 Shop By Category
            </a>

            <a href="index.html#best-sellers">
                🔥 Best Sellers
            </a>

            <a href="index.html#new-arrivals-home">
                🆕 New Arrivals
            </a>

            <a href="index.html#pet-care">
                🩺 Pet Care & Grooming
            </a>

            <a href="index.html#aquarium-services">
                🐠 Aquarium Services
            </a>

            <a href="care-guide.html">
                📚 Pet Care Guide
            </a>

        </div>

    </div>


    <!-- BECOME A PARTNER -->
    <div class="mobile-dropdown">

        <button
            class="mobile-dropdown-title"
            onclick="toggleMobileDropdown(this)"
        >
            🤝 <span>Become a Partner</span>
            <b>›</b>
        </button>

        <div class="mobile-submenu">

            <a href="seller-signup.html">
                📝 Partner Signup
            </a>

            <a href="seller-login.html">
                🔑 Partner Login
            </a>

            <a href="seller-dashboard.html">
                📊 Partner Dashboard
            </a>

            <a href="marketplace.html">
                🛍 Marketplace
            </a>

        </div>

    </div>


    <!-- ABOUT -->
    <a href="about.html" class="mobile-main-link">
        ℹ️ <span>About</span>
    </a>


        <!-- CONTACT -->
    <a href="contact.html" class="mobile-main-link">
        📞 <span>Contact</span>
    </a>

`;

    initLanguage();

}

// ============================================================
// SEARCH
// ============================================================

function searchWebsite(event) {

    if (event) {
        event.preventDefault();
    }


    const input =
        document.getElementById("searchInput");


    if (!input) return;


    const search =
        input.value
            .toLowerCase()
            .trim();


    // Empty search

    if (search === "") {

        alert(
            "Please enter something to search."
        );

        input.focus();

        return;
    }


    // ========================================================
    // PETS
    // ========================================================

    if (
        search.includes("fish") ||
        search.includes("fishes")
    ) {

        window.location.href =
            "fish.html";

        return;
    }


    if (
        search.includes("bird") ||
        search.includes("parrot")
    ) {

        window.location.href =
            "birds.html";

        return;
    }


    if (
        search.includes("dog") ||
        search.includes("puppy")
    ) {

        window.location.href =
            "dogs.html";

        return;
    }


    if (
        search.includes("cat") ||
        search.includes("kitten")
    ) {

        window.location.href =
            "cats.html";

        return;
    }


    if (
        search.includes("small pet") ||
        search.includes("small pets") ||
        search.includes("hamster") ||
        search.includes("rabbit") ||
        search.includes("chinchilla")
    ) {

        window.location.href =
            "small-pets.html";

        return;
    }


    // ========================================================
    // PRODUCTS
    // ========================================================

    if (
        search.includes("food") ||
        search.includes("pet food") ||
        search.includes("feed")
    ) {

        window.location.href =
            "foods.html";

        return;
    }


    if (
        search.includes("accessor") ||
        search.includes("collar") ||
        search.includes("leash") ||
        search.includes("bowl")
    ) {

        window.location.href =
            "accessories.html";

        return;
    }


    if (
        search.includes("aquarium") ||
        search.includes("fish tank") ||
        search.includes("tank")
    ) {

        window.location.href =
            "aquariums.html";

        return;
    }


    // ========================================================
    // TOYS
    // ========================================================

    if (
        search.includes("toy") ||
        search.includes("toys") ||
        search.includes("kids") ||
        search.includes("baby") ||
        search.includes("educational") ||
        search.includes("stem")
    ) {

        window.location.href =
            "toys.html";

        return;
    }


    // ========================================================
    // OTHER PAGES
    // ========================================================

    if (search.includes("about")) {

        window.location.href =
            "about.html";

        return;
    }


    if (
        search.includes("contact") ||
        search.includes("support")
    ) {

        window.location.href =
            "contact.html";

        return;
    }


    if (
        search.includes("partner") ||
        search.includes("seller")
    ) {

        window.location.href =
            "seller-login.html";

        return;
    }


    if (
        search.includes("wishlist") ||
        search.includes("wish list")
    ) {

        window.location.href =
            "wishlist.html";

        return;
    }


    if (search.includes("cart")) {

        window.location.href =
            "cart.html";

        return;
    }


    // ========================================================
    // NO RESULT
    // ========================================================

    alert(
        "No matching products or categories found."
    );

}


// ============================================================
// ENTER KEY SEARCH
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        const active =
            document.activeElement;


        if (
            event.key === "Enter" &&
            active &&
            active.id === "searchInput"
        ) {

            searchWebsite(event);

        }

    }
);
// ============================================================
// CLOSE MOBILE MENU WHEN CLICKING A LINK
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const target = event.target;

        if (
            target &&
            target.closest &&
            target.closest("#mobileMenu a")
        ) {
            closeMenu();
        }

    }
);


// ============================================================
// MOBILE DROPDOWNS
// ============================================================

function toggleMobileDropdown(button) {

    const dropdown =
        button.closest(".mobile-dropdown");

    if (!dropdown) return;

    const submenu =
        dropdown.querySelector(".mobile-submenu");

    const arrow =
        button.querySelector("b");

    if (!submenu) return;

    const isOpen =
        dropdown.classList.contains("open");


    // Close every other dropdown
    document
        .querySelectorAll(".mobile-dropdown")
        .forEach(function (item) {

            item.classList.remove("open");

            const otherSubmenu =
                item.querySelector(".mobile-submenu");

            const otherArrow =
                item.querySelector(
                    ".mobile-dropdown-title b"
                );


            if (otherSubmenu) {
                otherSubmenu.style.display = "none";
            }


            if (otherArrow) {
                otherArrow.textContent = "›";
            }

        });


    // Open clicked dropdown
    if (!isOpen) {

        dropdown.classList.add("open");

        submenu.style.display = "block";


        if (arrow) {
            arrow.textContent = "⌄";
        }

    }

}


// ============================================================
// INITIALIZE NAVBAR
// ============================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            applyUnifiedNavbar();
        }
    );

} else {

    applyUnifiedNavbar();

}
// ============================================================
// LANGUAGE (Google Translate)
// ============================================================

function setLang(code) {
    const combo = document.querySelector(".goog-te-combo");
    if (!combo) { setTimeout(() => setLang(code), 300); return; }
    combo.value = code;
    combo.dispatchEvent(new Event("change"));
}

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "en,ta,hi,te,ml,kn,mr,bn,gu,pa",
        autoDisplay: false
    }, "google_translate_element");

    const saved = localStorage.getItem("siteLang");
    if (saved && saved !== "en") setLang(saved);
}

function initLanguage() {
    // Hidden container Google needs
    if (!document.getElementById("google_translate_element")) {
        const div = document.createElement("div");
        div.id = "google_translate_element";
        div.style.display = "none";
        document.body.appendChild(div);
    }

    // Set dropdowns to the saved language and listen for changes
    const saved = localStorage.getItem("siteLang") || "en";
    document.querySelectorAll(".lang-select").forEach(function (sel) {
        sel.value = saved;
        sel.addEventListener("change", function () {
            localStorage.setItem("siteLang", this.value);
            document.querySelectorAll(".lang-select").forEach(s => s.value = this.value);
            setLang(this.value);
        });
    });

    // Load Google Translate once
    if (!document.getElementById("gt-script")) {
        const s = document.createElement("script");
        s.id = "gt-script";
        s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(s);
    }
}
// ============================================================
// PLAY STORE APP POPUP (shows after welcome popup is closed)
// ============================================================

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=YOUR.PACKAGE.NAME"; // <-- your real link
const APP_POPUP_DAYS = 3;   // don't show again for this many days after closing

function showAppPopup() {
    if (document.getElementById("appPopup")) return;

    const last = localStorage.getItem("appPopupClosed");
    if (last && Date.now() - Number(last) < APP_POPUP_DAYS * 86400000) return;

    const overlay = document.createElement("div");
    overlay.id = "appPopup";
    overlay.className = "app-popup-overlay";
    overlay.innerHTML = `
        <div class="app-popup-box">
            <button class="app-popup-close" aria-label="Close">✕</button>

            <div class="app-popup-top">
                <img src="images/vimallogo.png?v=2" alt="Vimal Pets & Toys" class="app-popup-logo">
                <h3>Get the Vimal App 📲</h3>
                <p>Shop pets, foods, accessories &amp; toys faster, with exclusive offers and order updates.</p>
            </div>

            <div class="app-popup-bottom">
                <ul>
                    <li>⚡ Faster checkout</li>
                    <li>🎁 App-only offers</li>
                    <li>🔔 Instant order updates</li>
                </ul>

                <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener" class="app-popup-install">
                    <span class="play-icon">▶</span>
                    <span>
                        <small>GET IT ON</small>
                        <b>Google Play</b>
                    </span>
                </a>

                <button class="app-popup-later">Maybe later</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    function close() {
        localStorage.setItem("appPopupClosed", Date.now());
        overlay.classList.remove("show");
        setTimeout(() => overlay.remove(), 300);
    }

    overlay.querySelector(".app-popup-close").onclick = close;
    overlay.querySelector(".app-popup-later").onclick = close;
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.querySelector(".app-popup-install").addEventListener("click", () => {
        localStorage.setItem("appPopupClosed", Date.now());
    });

    requestAnimationFrame(() => overlay.classList.add("show"));
}

// Wait until the welcome popup is gone, then show the app popup
function scheduleAppPopup() {
    const timer = setInterval(function () {
        const welcome = document.getElementById("offerPopup");
        const welcomeOpen = welcome && getComputedStyle(welcome).display !== "none";
        if (!welcomeOpen) {
            clearInterval(timer);
            setTimeout(showAppPopup, 1500);   // 1.5s after welcome popup closes
        }
    }, 500);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleAppPopup);
} else {
    scheduleAppPopup();
}