(function () {
    const navbarHtml = `
<nav class="navbar">
    <div class="mobile-menu-btn" onclick="openMenu()">
        ☰
    </div>
    <div class="logo">
        <a href="index.html" class="logo-link">
            <img src="images/vimallogo.png?v=2" alt="Vimal Farms" class="navbar-logo">
            <span class="logo-text">Farms</span>
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

        <button onclick="searchWebsite()">
            🔍
        </button>
    </div>
    <ul class="nav-links">
        <li><a href="index.html">Home</a></li>

        <li class="dropdown">
            <a href="#" onclick="toggleDropdown(event, this)">Pets ▼</a>
            <div class="dropdown-content">
                <a href="fish.html">🐟 Fish</a>
                <a href="birds.html">🦜 Birds</a>
                <a href="dogs.html">🐶 Dogs</a>
                <a href="cats.html">🐱 Cats</a>
                <a href="small-pets.html">🐹 Small Pets</a>
            </div>
        </li>

        <li class="dropdown">
            <a href="#" onclick="toggleDropdown(event, this)">Shop ▼</a>
            <div class="dropdown-content">
                <a href="marketplace.html">🛍️ Marketplace</a>
                <a href="foods.html">🍖 Pet Foods</a>
                <a href="accessories.html">🎯 Accessories</a>
                <a href="aquariums.html">🐠 Aquariums</a>
            </div>
        </li>

        <li class="dropdown">
            <a href="#" onclick="toggleDropdown(event, this)">Seller ▼</a>
            <div class="dropdown-content">
                <a href="seller-signup.html">📝 Become a Seller</a>
                <a href="seller-login.html">🔑 Seller Login</a>
                <a href="seller-dashboard.html">📊 Seller Dashboard</a>
            </div>
        </li>

        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="cart.html" class="cart-link">🛒</a></li>
    </ul>

    <div class="user-actions" id="userActions">
        <a href="login.html" class="login-link">👤 Login</a>
    </div>
</nav>

<div id="mobileMenu" class="mobile-menu">
    <span class="close-menu" onclick="closeMenu()">✕</span>
    <a href="index.html">🏠 Home</a>
    <a href="fish.html">🐟 Fish</a>
    <a href="birds.html">🦜 Birds</a>
    <a href="dogs.html">🐶 Dogs</a>
    <a href="cats.html">🐱 Cats</a>
    <a href="small-pets.html">🐹 Small Pets</a>
    <a href="marketplace.html">🛍️ Marketplace</a>
    <a href="foods.html">🍖 Pet Foods</a>
    <a href="accessories.html">🛍 Accessories</a>
    <a href="aquariums.html">🐠 Aquariums</a>
    <a href="seller-signup.html">📝 Become a Seller</a>
    <a href="seller-login.html">🔑 Seller Login</a>
    <a href="about.html">ℹ About</a>
    <a href="contact.html">📞 Contact</a>
    <a href="cart.html">🛒 Cart</a>
</div>
`;

    function insertNavbar() {
        if (document.querySelector('.navbar')) {
            return;
        }

        document.body.insertAdjacentHTML('afterbegin', navbarHtml);

        const currentPadding = parseInt(window.getComputedStyle(document.body).paddingTop, 10) || 0;
        if (currentPadding < 100) {
            document.body.style.paddingTop = '100px';
        }
    }

    document.addEventListener('DOMContentLoaded', insertNavbar);
})();
