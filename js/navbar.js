// ============================================================
// VIMAL PETS & TOYS - UNIVERSAL NAVBAR
// Desktop + Mobile
// ============================================================


// ============================================================
// MOBILE MENU
// ============================================================

function openMenu() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {

        mobileMenu.style.left = "0";

        document.body.classList.add("menu-open");
    }
}


function closeMenu() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {

        mobileMenu.style.left = "-280px";

        document.body.classList.remove("menu-open");
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
             TOP BAR
        =================================================== -->

        <div class="vimal-topbar">

            <div class="vimal-top-left">

                <a href="contact.html">
                    Help &amp; Support
                </a>

            </div>


            <div class="vimal-top-right">

                <a href="seller-signup.html">
                    Partner With Us
                </a>

                <a href="track-order.html">
                    Track Order
                </a>

            </div>

        </div>


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

        <!-- CLOSE -->

        <span
            class="close-menu"
            onclick="closeMenu()">

            ✕

        </span>


        <!-- HOME -->

        <a href="index.html">
            🏠 Home
        </a>


        <!-- ==================================================
             TOYS
        =================================================== -->

        <a href="toys.html">
            🧸 Toys — All
        </a>


        <a href="toys.html#kids-toys">
            🧒 Kids Toys
        </a>


        <a href="toys.html#baby-toddler">
            👶 Baby &amp; Toddler
        </a>


        <a href="toys.html#art-creativity">
            🎨 Art &amp; Creativity
        </a>


        <a href="toys.html#educational-stem">
            🧠 Educational &amp; STEM
        </a>


        <a href="toys.html#outdoor-sports">
            ⚽ Outdoor &amp; Sports
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


        <a href="toys.html#family-games">
            👨‍👩‍👧 Family &amp; Group Games
        </a>


        <a href="toys.html#unique-trending">
            ✨ Unique &amp; Trending
        </a>


        <a href="toys.html#pet-toys">
            🐾 Pet Toys
        </a>


        <!-- ==================================================
             PETS
        =================================================== -->

        <a href="fish.html">
            🐟 Fish
        </a>


        <a href="birds.html">
            🦜 Birds
        </a>


        <a href="dogs.html">
            🐶 Dogs
        </a>


        <a href="cats.html">
            🐱 Cats
        </a>


        <a href="small-pets.html">
            🐹 Small Pets
        </a>


        <!-- ==================================================
             PRODUCTS
        =================================================== -->

        <a href="marketplace.html">
            🛍️ Marketplace
        </a>


        <a href="foods.html">
            🍖 Pet Foods
        </a>


        <a href="accessories.html">
            🛍 Accessories
        </a>


        <a href="aquariums.html">
            🐠 Aquariums
        </a>


        <!-- ==================================================
             PARTNER
        =================================================== -->

        <a href="seller-signup.html">
            📝 Become a Partner
        </a>


        <a href="seller-login.html">
            🔑 Partner Login
        </a>


        <a href="seller-dashboard.html">
            📊 Partner Dashboard
        </a>


        <!-- ==================================================
             EXPLORE
        =================================================== -->

        <a href="index.html#shop-by-category">
            🗂 Shop By Category
        </a>


        <a href="care-guide.html">
            📚 Pet Care Guide
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


        <!-- ==================================================
             OTHER
        =================================================== -->

        <a href="about.html">
            ℹ About
        </a>


        <a href="contact.html">
            📞 Contact
        </a>


        <!-- ==================================================
             ACCOUNT
        =================================================== -->

        <a href="seller-login.html">
            👤 Partner Account
        </a>


        <a href="wishlist.html">
            ♡ Wishlist
        </a>


        <a href="cart.html">
            🛒 Cart
        </a>

    `;

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

        const target =
            event.target;


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
// INITIALIZE NAVBAR
// ============================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            applyUnifiedNavbar();

        }
    );

}
else {

    applyUnifiedNavbar();

}