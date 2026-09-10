// Vimal Pets World - Toys Category Filter
// ------------------------------------------------------------------
// Reads ?category=<slug> from the URL on toys.html and shows only the
// .product-card elements whose data-category attribute contains that
// slug. No category param (or an unknown one with no matches) falls
// back to showing every toy / a friendly "no products yet" message.
//
// This does NOT touch the Shop mega-menu, the navbar, or any other
// page's product-filter logic (dogs.html, cats.html, etc. use their
// own #minPrice/#maxPrice/#sortFilter script in js/script.js, which is
// left completely untouched).
// ------------------------------------------------------------------

(function () {

    function getCategoryFromURL() {
        var params = new URLSearchParams(window.location.search);
        var category = params.get("category");
        return category ? category.trim().toLowerCase() : "";
    }

    // Build a { slug: "Human readable label" } map straight from the
    // existing Shop → Toys mega-menu links, so the on-page heading text
    // always matches the wording already used in the dropdown, with no
    // need to duplicate ~80 category names in JS.
    function buildCategoryLabelMap() {
        var map = {};
        document.querySelectorAll(".toys-menu a[href]").forEach(function (link) {
            var href = link.getAttribute("href") || "";
            var match = href.match(/category=([^&]+)/);
            if (!match) return;
            var slug = decodeURIComponent(match[1]).trim().toLowerCase();
            if (!map[slug]) {
                map[slug] = link.textContent.trim();
            }
        });
        return map;
    }

    document.addEventListener("DOMContentLoaded", function () {

        var productsSection = document.querySelector(".products");
        if (!productsSection) return;

        var cards = Array.from(productsSection.querySelectorAll(".product-card"));

        var categoryLabelEl = document.getElementById("toysCategoryLabel");
        var filterCountEl = document.getElementById("toysFilterCount");
        var noToysFoundEl = document.getElementById("noToysFound");

        var categorySlug = getCategoryFromURL();
        var labelMap = buildCategoryLabelMap();

        function applyToyCategoryFilter() {

            var visibleCount = 0;

            cards.forEach(function (card) {
                var cardCategories = (card.getAttribute("data-category") || "")
                    .toLowerCase()
                    .split(/\s+/)
                    .filter(Boolean);

                var matches = !categorySlug || cardCategories.indexOf(categorySlug) !== -1;

                card.style.display = matches ? "" : "none";
                if (matches) visibleCount++;
            });

            if (categoryLabelEl) {
                if (!categorySlug) {
                    categoryLabelEl.textContent = "🧸 Showing: All Toys";
                } else {
                    var readableName = labelMap[categorySlug] || categorySlug;
                    categoryLabelEl.textContent = "🧸 Showing: " + readableName;
                }
            }

            if (filterCountEl) {
                filterCountEl.textContent =
                    visibleCount + " product" + (visibleCount !== 1 ? "s" : "") + " found";
            }

            if (noToysFoundEl) {
                noToysFoundEl.style.display =
                    (categorySlug && visibleCount === 0) ? "block" : "none";
            }
        }

        // "Show All Toys" button — clears the category filter by
        // navigating back to a plain toys.html (mirrors the existing
        // clearFilters() pattern used on other product pages).
        window.showAllToys = function () {
            window.location.href = "toys.html";
        };

        applyToyCategoryFilter();
    });

})();
