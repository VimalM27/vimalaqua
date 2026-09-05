// Vimal Pets World - Product Card Linker
// Makes each existing .product-card on category/listing pages open its
// matching /product/<slug> detail page, WITHOUT changing any existing
// markup, cart, or wishlist behaviour on this page.
// Clicking the Add to Cart button, the wishlist heart, or the delivery
// checker still works exactly as before (click does not bubble to the card).

(function () {
    function slugify(name) {
        return (name || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".product-card").forEach(function (card) {
            var titleEl = card.querySelector("h2, h3");
            if (!titleEl) return;

            var name = titleEl.textContent.trim();
            var slug = slugify(name);
            if (!slug) return;

            var url = "/product/" + slug;

            card.style.cursor = "pointer";
            card.setAttribute("data-product-link", url);

            card.addEventListener("click", function (e) {
                // Don't navigate if the click was on an interactive control
                // inside the card (Add to Cart, wishlist heart, delivery
                // checker input/button, or any link already inside the card).
                if (e.target.closest("button, a, input, .wishlist-btn, .delivery-check")) {
                    return;
                }
                window.location.href = url;
            });
        });
    });
})();
