// ================= MOBILE MENU =================

function openMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) {
        mobileMenu.style.left = "0";
    }
}

function closeMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) {
        mobileMenu.style.left = "-280px";
    }
}

// ================= UNIVERSAL NAV BAR =================

function applyUnifiedNavbar() {
    const nav = document.querySelector("nav.navbar");
    if (!nav) return;

    nav.innerHTML = `
        <div class="mobile-menu-btn" onclick="openMenu()">
            ☰
        </div>

        <div class="logo">
            <a href="index.html" class="logo-link">
                <img src="images/vimallogo.png?v=2" alt="Vimal Pets World" class="navbar-logo">
            </a>
        </div>

        <a href="login.html" class="mobile-login" id="mobileLoginLink">
            👤
        </a>

        <div class="search-box">
            <input
                type="text"
                id="searchInput"
                placeholder="Search pets, foods, accessories...">

            <button onclick="searchWebsite()">🔍</button>
        </div>

        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="toys.html">Toys</a></li>

            <li class="dropdown">
                <a href="#" onclick="toggleDropdown(event,this)">Pets & Accessories ▼</a>

                <div class="mega-menu">
                    <div class="menu-column">
                        <h4>Pets</h4>

                        <a href="dogs.html">🐶 Dogs</a>
                        <a href="cats.html">🐱 Cats</a>
                        <a href="fish.html">🐟 Fish</a>
                    </div>

                    <div class="menu-column">
                        <h4>Products</h4>

                        <a href="marketplace.html">🛍 Marketplace</a>
                        <a href="foods.html">🍖 Pet Foods</a>
                        <a href="accessories.html">🎯 Accessories</a>
                        <a href="aquariums.html">🐠 Aquariums</a>
                    </div>

                    <div class="menu-column">
                        <h4>Explore</h4>

                        <a href="index.html#shop-by-category">🗂 Shop By Category</a>
                        <a href="index.html#best-sellers">🔥 Best Sellers</a>
                        <a href="index.html#new-arrivals-home">🆕 New Arrivals</a>
                        <a href="index.html#pet-care">🩺 Pet Care & Grooming</a>
                        <a href="index.html#aquarium-services">🐠 Aquarium Services</a>
                        <a href="care-guide.html">📚 Pet Care Guide</a>
                    </div>
                </div>
            </li>

            <li class="dropdown">
                <a href="#" onclick="toggleDropdown(event,this)">Supplier ▼</a>

                <div class="dropdown-content">
                    <a href="seller-signup.html">📝 Become a Partner</a>
                    <a href="seller-login.html">🔑 Partner Login</a>
                    <a href="seller-dashboard.html">📊 Partner Dashboard</a>
                </div>
            </li>

            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li>
                <a href="wishlist.html" class="wishlist-link">
                    ♡ <span id="wishlistCount">0</span>
                </a>
            </li>
            <li>
                <a href="cart.html" class="cart-link">🛒</a>
            </li>
        </ul>

        <div class="user-actions" id="userActions">
            <a href="login.html" class="login-link">👤 Login</a>
        </div>
    `;

    let mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu) {
        mobileMenu = document.createElement("div");
        mobileMenu.id = "mobileMenu";
        mobileMenu.className = "mobile-menu";
        document.body.appendChild(mobileMenu);
    }

    mobileMenu.innerHTML = `
        <span class="close-menu" onclick="closeMenu()">✕</span>

        <a href="index.html">🏠 Home</a>
        <a href="toys.html">🏠 Toys</a>
        <a href="fish.html">🐟 Fish</a>
        <a href="birds.html">🦜 Birds</a>
        <a href="dogs.html">🐶 Dogs</a>
        <a href="cats.html">🐱 Cats</a>
        <a href="small-pets.html">🐹 Small Pets</a>
        <a href="marketplace.html">🛍️ Marketplace</a>
        <a href="foods.html">🍖 Pet Foods</a>
        <a href="accessories.html">🛍 Accessories</a>
        <a href="aquariums.html">🐠 Aquariums</a>
        <a href="seller-signup.html">📝 Become a Partner</a>
        <a href="seller-login.html">🔑 Partner Login</a>
        <a href="index.html#shop-by-category">🗂 Shop By Category</a>
        <a href="care-guide.html">📚 Pet Care Guide</a>
        <a href="index.html#best-sellers">🔥 Best Sellers</a>
        <a href="index.html#new-arrivals-home">🆕 New Arrivals</a>
        <a href="index.html#pet-care">🩺 Pet Care & Grooming</a>
        <a href="index.html#aquarium-services">🐠 Aquarium Services</a>
        <a href="about.html">ℹ About</a>
        <a href="contact.html">📞 Contact</a>
        <a href="cart.html">🛒 Cart</a>
    `;
}

applyUnifiedNavbar();

// ================= SEARCH =================

function searchWebsite() {

    let search = document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if (search === "") {
        alert("Please enter something to search.");
        return;
    }

    if (search.includes("fish")) {
        window.location.href = "fish.html";
    }
    else if (search.includes("bird")) {
        window.location.href = "birds.html";
    }
    else if (search.includes("dog")) {
        window.location.href = "dogs.html";
    }
    else if (search.includes("cat")) {
        window.location.href = "cats.html";
    }
    else if (search.includes("small")) {
        window.location.href = "small-pets.html";
    }
    else if (search.includes("food")) {
        window.location.href = "foods.html";
    }
    else if (search.includes("accessory")) {
        window.location.href = "accessories.html";
    }
    else if (search.includes("aquarium")) {
        window.location.href = "aquariums.html";
    }
    else if (search.includes("about")) {
        window.location.href = "about.html";
    }
    else if (search.includes("contact")) {
        window.location.href = "contact.html";
    }
    else {
        alert("No matching products found.");
    }

}