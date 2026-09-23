
/* Vimal Pets & Toys - MOBILE DROPDOWN ADD-ON
   This runs only on screens <= 768px.
   It does NOT alter the desktop navbar/dropdowns.
*/
(function () {
  function setupMobileDropdowns() {
    if (window.innerWidth > 768) return;

    const menu = document.getElementById("mobileMenu");
    if (!menu) return;

    // Prevent duplicate setup.
    if (menu.dataset.vimalDropdownReady === "1") return;
    menu.dataset.vimalDropdownReady = "1";

    const logoSrc = "images/vimallogo.png?v=2";

    menu.innerHTML = `
      <div class="vimal-mobile-head">
        <a class="vimal-mobile-brand" href="index.html" aria-label="Vimal Pets & Toys Home">
          <img src="${logoSrc}" alt="Vimal Pets & Toys">
        </a>
        <button class="vimal-mobile-close" type="button" aria-label="Close menu">✕</button>
      </div>

      <div class="vimal-mobile-links">
        <a class="vimal-mobile-link" href="index.html">🏠 Home</a>

        <button class="vimal-mobile-accordion" type="button">
          <span>🧸 Toys</span><span class="arrow">▼</span>
        </button>
        <div class="vimal-mobile-submenu">
          <a href="toys.html">🧸 All Toys</a>
          <div class="vimal-mobile-section-title">Kids & Young</div>
          <a href="toys.html#kids-toys">🧒 Kids Toys</a>
          <a href="toys.html#baby-toddler">👶 Baby & Toddler</a>
          <a href="toys.html#teens">🎮 Teens</a>
          <a href="toys.html#adults-hobbies">🧑 Adults & Hobbies</a>
          <a href="toys.html#seniors">👵 Seniors</a>
          <div class="vimal-mobile-section-title">Learning & Creativity</div>
          <a href="toys.html#art-creativity">🎨 Art & Creativity</a>
          <a href="toys.html#educational-stem">🧠 Educational & STEM</a>
          <a href="toys.html#unique-trending">✨ Unique & Trending</a>
          <div class="vimal-mobile-section-title">Fun & Games</div>
          <a href="toys.html#outdoor-sports">⚽ Outdoor & Sports</a>
          <a href="toys.html#family-games">👨‍👩‍👧 Family & Group Games</a>
          <a href="toys.html#pet-toys">🐾 Pet Toys</a>
        </div>

        <button class="vimal-mobile-accordion" type="button">
          <span>🐾 Pets & Accessories</span><span class="arrow">▼</span>
        </button>
        <div class="vimal-mobile-submenu">
          <div class="vimal-mobile-section-title">Pets</div>
          <a href="dogs.html">🐶 Dogs</a>
          <a href="cats.html">🐱 Cats</a>
          <a href="fish.html">🐟 Fish</a>
          <a href="birds.html">🦜 Birds</a>
          <a href="small-pets.html">🐹 Small Pets</a>
          <div class="vimal-mobile-section-title">Products</div>
          <a href="foods.html">🍖 Pet Foods</a>
          <a href="accessories.html">🎯 Accessories</a>
          <a href="aquariums.html">🐠 Aquariums</a>
          <div class="vimal-mobile-section-title">Explore</div>
          <a href="index.html#shop-by-category">🗂 Shop By Category</a>
          <a href="index.html#best-sellers">🔥 Best Sellers</a>
          <a href="index.html#new-arrivals-home">🆕 New Arrivals</a>
          <a href="index.html#pet-care">🩺 Pet Care & Grooming</a>
          <a href="index.html#aquarium-services">🐠 Aquarium Services</a>
          <a href="care-guide.html">📚 Pet Care Guide</a>
        </div>

        <button class="vimal-mobile-accordion" type="button">
          <span>🤝 Become a Partner</span><span class="arrow">▼</span>
        </button>
        <div class="vimal-mobile-submenu">
          <a href="seller-signup.html">📝 Partner Signup</a>
          <a href="seller-login.html">🔑 Partner Login</a>
          <a href="seller-dashboard.html">📊 Partner Dashboard</a>
          <a href="marketplace.html">🛍 Marketplace</a>
        </div>

        <a class="vimal-mobile-link" href="about.html">ℹ️ About</a>
        <a class="vimal-mobile-link" href="contact.html">📞 Contact</a>
        <a class="vimal-mobile-link" href="wishlist.html">♡ Wishlist</a>
        <a class="vimal-mobile-link" href="cart.html">🛒 Cart</a>
      </div>
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "vimal-mobile-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);

    const open = function () {
      menu.classList.add("active", "vimal-mobile-open");
      backdrop.classList.add("show");
      document.body.classList.add("vimal-mobile-menu-open");
    };

    const close = function () {
      menu.classList.remove("active", "vimal-mobile-open");
      backdrop.classList.remove("show");
      document.body.classList.remove("vimal-mobile-menu-open");
    };

    // Keep the existing global hamburger working.
    window.openMenu = open;
    window.closeMenu = close;

    const hamburger = document.querySelector(".navbar .mobile-menu-btn");
    if (hamburger) hamburger.onclick = open;

    menu.querySelector(".vimal-mobile-close").addEventListener("click", close);
    backdrop.addEventListener("click", close);

    menu.querySelectorAll(".vimal-mobile-accordion").forEach(function (button) {
      button.addEventListener("click", function () {
        const submenu = button.nextElementSibling;
        const isOpen = submenu.classList.contains("open");

        // Accordion: close other groups.
        menu.querySelectorAll(".vimal-mobile-submenu.open").forEach(function (other) {
          if (other !== submenu) other.classList.remove("open");
        });
        menu.querySelectorAll(".vimal-mobile-accordion.open").forEach(function (other) {
          if (other !== button) other.classList.remove("open");
        });

        submenu.classList.toggle("open", !isOpen);
        button.classList.toggle("open", !isOpen);
      });
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        close();
      });
    });
  }

  // navbar.js normally creates #mobileMenu before this script loads.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMobileDropdowns);
  } else {
    setupMobileDropdowns();
  }

  // If a page has a late-loaded navbar, retry briefly.
  let tries = 0;
  const timer = setInterval(function () {
    if (document.getElementById("mobileMenu")) {
      setupMobileDropdowns();
      clearInterval(timer);
    }
    if (++tries > 30) clearInterval(timer);
  }, 100);
})();
