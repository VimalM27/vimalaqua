// Vimal Farms - Wishlist (client-side, saved per browser/device)
// Note: This does NOT sync across devices or accounts. Once you add real
// user login (backend), this should be upgraded to save wishlist per account.

document.addEventListener('DOMContentLoaded', function () {
  const WISHLIST_KEY = 'vimalWishlist';

  function getWishlist() {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  }

  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    updateWishlistCount();
  }

  function updateWishlistCount() {
    const countEl = document.getElementById('wishlistCount');
    if (countEl) {
      countEl.textContent = getWishlist().length;
    }
  }

  function isWishlisted(name) {
    return getWishlist().includes(name);
  }

  function toggleWishlist(name, btn) {
    let list = getWishlist();
    if (list.includes(name)) {
      list = list.filter(item => item !== name);
      btn.classList.remove('active');
      btn.textContent = '♡';
    } else {
      list.push(name);
      btn.classList.add('active');
      btn.textContent = '❤️';
    }
    saveWishlist(list);
  }

  document.querySelectorAll('.product-card').forEach(card => {
    const titleEl = card.querySelector('h2');
    const priceEl = card.querySelector('.price');
    if (!titleEl || !priceEl) return;
    const name = titleEl.textContent.trim();

    const btn = document.createElement('button');
    btn.className = 'wishlist-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Add to Wishlist');
    btn.textContent = isWishlisted(name) ? '❤️' : '♡';
    if (isWishlisted(name)) btn.classList.add('active');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleWishlist(name, btn);
    });

    // Wrap the price and heart button together so the heart sits
    // to the right of the price, below the image (not on top of it)
    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';
    priceEl.parentNode.insertBefore(priceRow, priceEl);
    priceRow.appendChild(priceEl);
    priceRow.appendChild(btn);
  });

  updateWishlistCount();
});