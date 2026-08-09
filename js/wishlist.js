// Vimal Pets World - Wishlist (client-side, saved per browser/device)
// Note: This does NOT sync across devices or accounts. Once you add real
// user login (backend), this should be upgraded to save wishlist per account.

document.addEventListener('DOMContentLoaded', function () {
  const WISHLIST_KEY = 'vimalWishlist';

  function getWishlist() {
    let list = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    // Migrate old format (array of plain name strings) to new object format
    list = list.map(item =>
      typeof item === 'string' ? { name: item, price: null, image: '' } : item
    );
    return list;
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
    return getWishlist().some(item => item.name === name);
  }

  function toggleWishlist(product, btn) {
    let list = getWishlist();
    if (list.some(item => item.name === product.name)) {
      list = list.filter(item => item.name !== product.name);
      btn.classList.remove('active');
      btn.textContent = '♡';
    } else {
      list.push(product);
      btn.classList.add('active');
      btn.textContent = '❤️';
    }
    saveWishlist(list);
  }

  document.querySelectorAll('.product-card').forEach(card => {
    const titleEl = card.querySelector('h2');
    const priceEl = card.querySelector('.price');
    const imgEl = card.querySelector('img');
    if (!titleEl || !priceEl) return;

    const name = titleEl.textContent.trim();
    const priceNum = parseFloat((priceEl.textContent || '').replace(/[^\d.]/g, '')) || 0;
    const image = imgEl ? imgEl.getAttribute('src') : '';

    const product = { name, price: priceNum, image };

    const btn = document.createElement('button');
    btn.className = 'wishlist-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Add to Wishlist');
    btn.textContent = isWishlisted(name) ? '❤️' : '♡';
    if (isWishlisted(name)) btn.classList.add('active');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleWishlist(product, btn);
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