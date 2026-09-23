/* Vimal Pets & Toys - MOBILE MENU ONLY
   Loaded AFTER the existing navbar.js.
   It changes only the mobile menu; desktop navigation is untouched. */
(function () {
  function buildMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;

    menu.innerHTML = `
      <div class="mobile-menu-head">
        <span class="mobile-menu-title">Vimal Pets & Toys</span>
        <span class="close-menu" onclick="closeMenu()">✕</span>
      </div>

      <a class="mobile-item" href="index.html">🏠 <span>Home</span></a>

      <button class="mobile-toggle" type="button" data-target="mobileToys">
        <span>🧸 Toys</span><span class="arrow">▼</span>
      </button>
      <div class="mobile-submenu" id="mobileToys">
        <a href="toys.html">🧸 All Toys</a>
        <a href="toys.html#kids-toys">🧒 Kids Toys</a>
        <a href="toys.html#baby-toddler">👶 Baby & Toddler</a>
        <a href="toys.html#art-creativity">🎨 Art & Creativity</a>
        <a href="toys.html#educational-stem">🧠 Educational & STEM</a>
        <a href="toys.html#outdoor-sports">⚽ Outdoor & Sports</a>
        <a href="toys.html#teens">🎮 Teens</a>
        <a href="toys.html#adults-hobbies">🧑 Adults & Hobbies</a>
        <a href="toys.html#seniors">👵 Seniors</a>
        <a href="toys.html#family-games">👨‍👩‍👧 Family & Group Games</a>
        <a href="toys.html#unique-trending">✨ Unique & Trending</a>
        <a href="toys.html#pet-toys">🐾 Pet Toys</a>
      </div>

      <button class="mobile-toggle" type="button" data-target="mobilePets">
        <span>🐾 Pets & Accessories</span><span class="arrow">▼</span>
      </button>
      <div class="mobile-submenu" id="mobilePets">
        <a href="dogs.html">🐶 Dogs</a>
        <a href="cats.html">🐱 Cats</a>
        <a href="fish.html">🐟 Fish</a>
        <a href="birds.html">🦜 Birds</a>
        <a href="small-pets.html">🐹 Small Pets</a>
        <a href="foods.html">🍖 Pet Foods</a>
        <a href="accessories.html">🎯 Accessories</a>
        <a href="aquariums.html">🐠 Aquariums</a>
        <a href="index.html#shop-by-category">🗂 Shop By Category</a>
        <a href="index.html#best-sellers">🔥 Best Sellers</a>
        <a href="index.html#new-arrivals-home">🆕 New Arrivals</a>
        <a href="index.html#pet-care">🩺 Pet Care & Grooming</a>
        <a href="index.html#aquarium-services">🐠 Aquarium Services</a>
        <a href="care-guide.html">📚 Pet Care Guide</a>
      </div>

      <button class="mobile-toggle" type="button" data-target="mobilePartner">
        <span>🤝 Become a Partner</span><span class="arrow">▼</span>
      </button>
      <div class="mobile-submenu" id="mobilePartner">
        <a href="seller-signup.html">📝 Partner Signup</a>
        <a href="seller-login.html">🔑 Partner Login</a>
        <a href="seller-dashboard.html">📊 Partner Dashboard</a>
        <a href="marketplace.html">🛍 Marketplace</a>
      </div>

      <a class="mobile-item" href="about.html">ℹ️ About</a>
      <a class="mobile-item" href="contact.html">📞 Contact</a>
      <a class="mobile-item" href="wishlist.html">♡ Wishlist</a>
      <a class="mobile-item" href="cart.html">🛒 Cart</a>
    `;

    menu.querySelectorAll('.mobile-toggle').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = document.getElementById(button.dataset.target);
        if (!target) return;
        const isOpen = target.classList.toggle('open');
        button.classList.toggle('open', isOpen);
      });
    });
  }

  // Override only the existing mobile open/close functions.
  window.openMenu = function () {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.style.left = '0';
    document.body.style.overflow = 'hidden';
  };

  window.closeMenu = function () {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.style.left = '-340px';
    document.body.style.overflow = '';
  };

  function init() {
    buildMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
