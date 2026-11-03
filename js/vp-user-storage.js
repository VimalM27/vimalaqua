/* Vimal Pets & Toys: per-user cart / wishlist storage.
   Problem fixed: the cart and wishlist were saved under one shared key in the browser, so everyone who used
   the same browser (guest, or any account) saw the same wishlist and cart.
   Now each logged-in user gets their own private copy, and guests get a separate one.
   Load this FIRST in <head>, before any other script. Nothing else in the site needs to change. */
(function () {
  'use strict';
  try {
    var SCOPED = { cart: 1, vimalWishlist: 1, currentOrder: 1 };
    var P = Storage.prototype, get = P.getItem, set = P.setItem, del = P.removeItem;
    var scope = 'guest';
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          var s = JSON.parse(get.call(localStorage, k));
          var u = s && (s.user || (s.currentSession && s.currentSession.user));
          if (u && u.id) { scope = 'u_' + String(u.id).replace(/[^a-z0-9_-]/gi, ''); break; }
        }
      }
    } catch (e) { scope = 'guest'; }
    window.VP_STORAGE_SCOPE = scope;
    function map(self, key) { return (self === window.localStorage && SCOPED[key]) ? key + ':' + scope : key; }
    P.getItem = function (key) { return get.call(this, map(this, key)); };
    P.setItem = function (key, val) { return set.call(this, map(this, key), val); };
    P.removeItem = function (key) { return del.call(this, map(this, key)); };
    /* one-time clean-up: the old shared copies could belong to anyone, so they are removed, not handed to anybody */
    ['cart', 'vimalWishlist', 'currentOrder'].forEach(function (k) { try { if (get.call(localStorage, k) !== null) del.call(localStorage, k); } catch (e) {} });
  } catch (e) { /* storage blocked: the site keeps working without it */ }
})();
