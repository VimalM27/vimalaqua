// =====================================================================
// Vimal Pets World — Reusable Dynamic Product Detail Page
// Reads the product for the current URL from window.VPW_PRODUCTS
// (js/products-data.js) and renders the whole page. One template,
// every product — nothing here is hardcoded per-product.
// =====================================================================

(function () {
    "use strict";

    var WISHLIST_KEY = "vimalWishlist";
    var NOT_PROVIDED = "Information not provided";

    // ---------------- URL helpers ----------------
    function getSlugFromURL() {
        var params = new URLSearchParams(window.location.search);
        if (params.get("id")) return decodeURIComponent(params.get("id"));

        var parts = window.location.pathname.split("/").filter(Boolean);
        // Matches /product/<slug>  (Vercel rewrite keeps this in the address bar)
        if (parts.length >= 2 && parts[0] === "product") {
            return decodeURIComponent(parts[1]);
        }
        if (window.location.hash && window.location.hash.length > 1) {
            return decodeURIComponent(window.location.hash.slice(1));
        }
        return null;
    }

    function formatINR(amount) {
        if (amount === null || amount === undefined) return "";
        return "₹" + Number(amount).toLocaleString("en-IN");
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str === undefined || str === null ? "" : String(str);
        return div.innerHTML;
    }

    function starString(rating) {
        var r = Math.round(rating || 0);
        return "★★★★★☆☆☆☆☆".slice(5 - r, 10 - r);
    }

    // ---------------- Wishlist (shared localStorage schema with wishlist.js / wishlist.html) ----------------
    function getWishlist() {
        var list = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
        return list.map(function (item) {
            return typeof item === "string" ? { name: item, price: null, image: "" } : item;
        });
    }
    function saveWishlist(list) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
        var countEl = document.getElementById("wishlistCount");
        if (countEl) countEl.textContent = list.length;
    }
    function isWishlisted(name) {
        return getWishlist().some(function (i) { return i.name === name; });
    }
    function toggleWishlist(product, btn) {
        var list = getWishlist();
        if (list.some(function (i) { return i.name === product.name; })) {
            list = list.filter(function (i) { return i.name !== product.name; });
            btn.classList.remove("active");
            btn.textContent = "♡";
            showPdToast(product.name + " removed from wishlist");
        } else {
            list.push({ name: product.name, price: product.price || 0, image: (product.images && product.images[0]) || "" });
            btn.classList.add("active");
            btn.textContent = "❤️";
            showPdToast(product.name + " added to wishlist");
        }
        saveWishlist(list);
    }

    // ---------------- Toast ----------------
    function showPdToast(message) {
        var toast = document.getElementById("pdToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "pdToast";
            toast.className = "pd-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
    }

    // ---------------- Breadcrumb ----------------
    function renderBreadcrumb(product) {
        var el = document.getElementById("breadcrumbBar");
        el.innerHTML =
            '<a href="/index.html">Home</a>' +
            '<span class="sep">→</span>' +
            '<a href="/' + escapeHtml(product.categoryPage) + '">' + escapeHtml(product.category) + '</a>' +
            '<span class="sep">→</span>' +
            '<span class="current">' + escapeHtml(product.name) + '</span>';
    }

    // ---------------- Gallery ----------------
    var galleryState = { images: [], index: 0 };

    function renderGallery(product) {
        var images = product.images && product.images.length ? product.images : [];
        galleryState.images = images;
        galleryState.index = 0;

        var wrap = document.getElementById("pdGallery");
        var hasImages = images.length > 0;

        var html = '<div class="pd-main-image-wrap" id="pdMainImageWrap">';
        if (hasImages) {
            html += '<img id="pdMainImage" src="' + escapeHtml(images[0]) + '" alt="' + escapeHtml(product.name) + '" loading="eager">';
            if (images.length > 1) {
                html += '<button class="pd-nav-btn prev" id="pdPrevBtn" aria-label="Previous image">‹</button>';
                html += '<button class="pd-nav-btn next" id="pdNextBtn" aria-label="Next image">›</button>';
            }
            html += '<span class="pd-zoom-hint">🔍 Click to zoom</span>';
        } else {
            html += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:60px;color:#cbd5e1;">🐾</div>';
        }
        html += "</div>";

        if (images.length > 1) {
            html += '<div class="pd-thumbs" id="pdThumbs">';
            images.forEach(function (img, i) {
                html +=
                    '<div class="pd-thumb' + (i === 0 ? " active" : "") + '" data-index="' + i + '">' +
                    '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(product.name) + " image " + (i + 1) + '" loading="lazy"></div>';
            });
            html += "</div>";
        }

        if (!hasImages) {
            html += '<p class="pd-gallery-missing-note">📷 No photo has been supplied for this listing yet — Vimal Pets World needs to add product photos here.</p>';
        } else if (images.length === 1) {
            html += '<p class="pd-gallery-missing-note">📷 Only one photo is on file for this listing. Add more photos for a fuller gallery (front, side, close-up, etc.).</p>';
        }

        wrap.innerHTML = html;
        bindGalleryEvents(product);
    }

    function setGalleryIndex(newIndex) {
        var images = galleryState.images;
        if (!images.length) return;
        galleryState.index = (newIndex + images.length) % images.length;
        var mainImg = document.getElementById("pdMainImage");
        if (mainImg) mainImg.src = images[galleryState.index];
        document.querySelectorAll(".pd-thumb").forEach(function (t, i) {
            t.classList.toggle("active", i === galleryState.index);
        });
    }

    function bindGalleryEvents(product) {
        var prevBtn = document.getElementById("pdPrevBtn");
        var nextBtn = document.getElementById("pdNextBtn");
        if (prevBtn) prevBtn.addEventListener("click", function () { setGalleryIndex(galleryState.index - 1); });
        if (nextBtn) nextBtn.addEventListener("click", function () { setGalleryIndex(galleryState.index + 1); });

        document.querySelectorAll(".pd-thumb").forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                setGalleryIndex(parseInt(thumb.getAttribute("data-index"), 10));
            });
        });

        var mainImg = document.getElementById("pdMainImage");
        if (mainImg && typeof window.openImagePopup === "function") {
            mainImg.style.cursor = "zoom-in";
            mainImg.addEventListener("click", function () {
                window.openImagePopup(galleryState.images[galleryState.index]);
            });
        }
    }

    // ---------------- Info panel ----------------
    function renderInfo(product) {
        var el = document.getElementById("pdInfo");
        var isPet = product.type === "pet";
        var availClass = product.priceOnRequest ? "contact" : (product.availability === "Available" ? "available" : "unavailable");
        var availLabel = product.priceOnRequest ? "Contact for Availability" : product.availability;

        var priceHtml = product.priceOnRequest
            ? '<span class="pd-price">Price on Request</span>'
            : '<span class="pd-price">' + formatINR(product.price) + "</span>";

        var ratingHtml = product.reviewCount > 0
            ? '<span class="stars">' + starString(product.rating) + "</span><span>" + product.rating.toFixed(1) + " (" + product.reviewCount + " review" + (product.reviewCount === 1 ? "" : "s") + ")</span>"
            : "<span>No reviews yet</span>";

        var html = "";
        html += '<span class="pd-category-tag">' + escapeHtml(product.category) + (isPet ? " · Live Pet" : "") + "</span>";
        html += '<h1 class="pd-title">' + escapeHtml(product.name) + "</h1>";
        html += '<div class="pd-subline"><span class="pd-rating">' + ratingHtml + '</span><span class="pd-sku">SKU: ' + escapeHtml(product.sku) + "</span></div>";
        html += '<div class="pd-price-row">' + priceHtml + "</div>";
        html += '<div class="pd-availability ' + availClass + '"><span class="dot"></span>' + escapeHtml(availLabel) + "</div>";

        html += '<div class="pd-seller-box">';
        html += "<div><strong>Seller:</strong> " + escapeHtml(product.seller.name) + "</div>";
        html += "<div><strong>Location:</strong> " + escapeHtml(product.seller.location) + "</div>";
        html += "</div>";

        html += '<p class="pd-short-desc">' + escapeHtml(product.description) + "</p>";

        if (!product.priceOnRequest) {
            if (!isPet) {
                html += '<div class="pd-qty-row"><div class="pd-qty-box">' +
                    '<button type="button" id="pdQtyMinus">−</button>' +
                    '<span id="pdQtyValue">1</span>' +
                    '<button type="button" id="pdQtyPlus">+</button>' +
                    "</div><span class=\"pd-qty-note\">Quantity</span></div>";
            } else {
                html += '<div class="pd-qty-row"><span class="pd-qty-note">Live pets are sold individually (quantity: 1).</span></div>';
            }
        }

        html += '<div class="pd-actions">';
        if (product.priceOnRequest) {
            html += '<a class="pd-btn pd-btn-cart" href="contact.html">📞 Contact for Price</a>';
        } else if (product.availability !== "Available") {
            html += '<button class="pd-btn pd-btn-cart" disabled>Currently Unavailable</button>';
        } else {
            html += '<button class="pd-btn pd-btn-cart" id="pdAddToCart">🛒 Add to Cart</button>';
            html += '<button class="pd-btn pd-btn-buy" id="pdBuyNow">⚡ Buy Now</button>';
        }
        html += '<button class="pd-btn-icon" id="pdWishlistBtn" aria-label="Add to Wishlist">' + (isWishlisted(product.name) ? "❤️" : "♡") + "</button>";
        html += '<button class="pd-btn-icon" id="pdShareBtn" aria-label="Share this product">🔗</button>';
        html += "</div>";

        html += renderDeliveryBox(product);

        el.innerHTML = html;

        var wishlistBtn = document.getElementById("pdWishlistBtn");
        if (isWishlisted(product.name)) wishlistBtn.classList.add("active");
        wishlistBtn.addEventListener("click", function () { toggleWishlist(product, wishlistBtn); });

        document.getElementById("pdShareBtn").addEventListener("click", function () { shareProduct(product); });

        var qtyValueEl = document.getElementById("pdQtyValue");
        var qty = 1;
        var minusBtn = document.getElementById("pdQtyMinus");
        var plusBtn = document.getElementById("pdQtyPlus");
        if (minusBtn && plusBtn) {
            minusBtn.addEventListener("click", function () {
                qty = Math.max(1, qty - 1);
                qtyValueEl.textContent = qty;
            });
            plusBtn.addEventListener("click", function () {
                qty = Math.min(20, qty + 1);
                qtyValueEl.textContent = qty;
            });
        }

        var addBtn = document.getElementById("pdAddToCart");
        if (addBtn) {
            addBtn.addEventListener("click", function () {
                addProductToCart(product, qty);
                showPdToast(product.name + " added to cart!");
            });
        }
        var buyBtn = document.getElementById("pdBuyNow");
        if (buyBtn) {
            buyBtn.addEventListener("click", function () {
                addProductToCart(product, qty);
                window.location.href = "checkout.html";
            });
        }
    }

    function addProductToCart(product, qty) {
        if (typeof window.addToCart !== "function") return;
        var image = (product.images && product.images[0]) || "";
        for (var i = 0; i < qty; i++) {
            window.addToCart(product.name, product.price, image);
        }
    }

    function shareProduct(product) {
        var url = window.location.href;
        var shareData = {
            title: product.name + " | Vimal Pets World",
            text: "Check out " + product.name + " on Vimal Pets World",
            url: url
        };
        if (navigator.share) {
            navigator.share(shareData).catch(function () {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
                showPdToast("Product link copied to clipboard!");
            });
        } else {
            window.prompt("Copy this link:", url);
        }
    }

    function renderDeliveryBox(product) {
        var d = product.delivery;
        var isPet = product.type === "pet";
        var html = '<div class="pd-delivery-box"><h4>🚚 Delivery & Pickup</h4>';
        html += '<div class="pd-delivery-row"><span class="ico">📦</span><span>' + (d.available
            ? "Delivery available — " + escapeHtml(d.estimate)
            : "Delivery not available for this item") + "</span></div>";
        html += '<div class="pd-delivery-row"><span class="ico">📍</span><span>' + escapeHtml(d.areaNote) + "</span></div>";
        html += '<div class="pd-delivery-row"><span class="ico">🏬</span><span>' +
            (d.pickup === null || d.pickup === undefined
                ? '<span class="muted">Pickup availability: ' + NOT_PROVIDED + " — please confirm with the seller.</span>"
                : (d.pickup ? "In-store pickup available in " + escapeHtml(product.seller.location) : "Pickup not available for this item")) +
            "</span></div>";
        if (isPet) {
            html += '<div class="pd-delivery-row"><span class="ico">🐾</span><span>Live animals travel in secure, ventilated packaging suited to the species, scheduled to minimise stress and travel time.</span></div>';
        }
        html += "</div>";
        return html;
    }

    // ---------------- Tabs: Description / Specs / Conditions ----------------
    function renderTabs(product) {
        var el = document.getElementById("pdDetails");
        var isPet = product.type === "pet";

        var specRows = "";
        var specLabels = isPet
            ? { breedSpecies: "Breed / Species", age: "Age", gender: "Gender", size: "Size", colour: "Colour",
                temperament: "Temperament", healthStatus: "Health Status", vaccination: "Vaccination",
                deworming: "Deworming", feedingInfo: "Feeding Information", specialCare: "Special Care Requirements",
                documentation: "Documentation" }
            : { brand: "Brand", productType: "Product Type", size: "Size", weight: "Weight", colour: "Colour",
                material: "Material / Ingredients", suitableFor: "Suitable For", suitableAge: "Suitable Age",
                usageInstructions: "Usage Instructions", warranty: "Warranty", expiry: "Expiry Information", stock: "Stock" };

        Object.keys(specLabels).forEach(function (key) {
            var val = product.specifications[key];
            var isMissing = val === NOT_PROVIDED;
            specRows += "<tr><td>" + specLabels[key] + '</td><td class="' + (isMissing ? "not-provided" : "") + '">' + escapeHtml(val) + "</td></tr>";
        });
        specRows += "<tr><td>SKU</td><td>" + escapeHtml(product.sku) + "</td></tr>";
        specRows += "<tr><td>Category</td><td>" + escapeHtml(product.category) + "</td></tr>";

        var conditionsHtml = (product.purchaseConditions || []).map(function (c) {
            return "<li>" + escapeHtml(c) + "</li>";
        }).join("");

        var html = "";
        html += '<div class="pd-tabs">' +
            '<button class="pd-tab-btn active" data-tab="desc">Description</button>' +
            '<button class="pd-tab-btn" data-tab="specs">Specifications</button>' +
            '<button class="pd-tab-btn" data-tab="conditions">' + (isPet ? "Purchase Conditions" : "Policies") + "</button>" +
            "</div>";

        html += '<div class="pd-tab-panel active" data-panel="desc"><div class="pd-desc-block">';
        html += "<h4>Overview</h4><p>" + escapeHtml(product.description) + "</p>";
        html += "<h4>Key Details</h4><ul>" +
            "<li>Category: " + escapeHtml(product.category) + "</li>" +
            "<li>SKU: " + escapeHtml(product.sku) + "</li>" +
            "<li>Sold by: " + escapeHtml(product.seller.name) + ", " + escapeHtml(product.seller.location) + "</li>" +
            "</ul>";
        html += "</div></div>";

        html += '<div class="pd-tab-panel" data-panel="specs"><table class="pd-spec-table">' + specRows + "</table></div>";

        html += '<div class="pd-tab-panel" data-panel="conditions"><div class="pd-desc-block"><ul>' + conditionsHtml + "</ul>" +
            '<p style="margin-top:14px;font-size:13.5px;color:#94a3b8;">Full policies: ' +
            '<a href="shipping-policy.html" style="color:#0f3d91;">Shipping</a> · ' +
            '<a href="cancellation-policy.html" style="color:#0f3d91;">Cancellation</a> · ' +
            '<a href="return-refund-policy.html" style="color:#0f3d91;">Returns &amp; Refunds</a>' +
            (isPet ? ' · <a href="pet-purchase-policy.html" style="color:#0f3d91;">Pet Purchase Policy</a>' : "") +
            "</p></div></div>";

        el.innerHTML = html;

        document.querySelectorAll(".pd-tab-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".pd-tab-btn").forEach(function (b) { b.classList.remove("active"); });
                document.querySelectorAll(".pd-tab-panel").forEach(function (p) { p.classList.remove("active"); });
                btn.classList.add("active");
                document.querySelector('.pd-tab-panel[data-panel="' + btn.getAttribute("data-tab") + '"]').classList.add("active");
            });
        });
    }

    // ---------------- Reviews ----------------
    function renderReviews(product) {
        var el = document.getElementById("pdReviews");
        var html = '<h2 class="pd-section-title">Customer Reviews</h2>';

        if (!product.reviews || product.reviews.length === 0) {
            html += '<div class="pd-no-reviews">⭐ No reviews yet. Be the first to review this product.</div>';
            el.innerHTML = html;
            return;
        }

        var counts = [0, 0, 0, 0, 0];
        product.reviews.forEach(function (r) {
            var idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
            counts[idx]++;
        });
        var total = product.reviews.length;

        html += '<div class="pd-rating-summary">';
        html += '<div><div class="pd-rating-big">' + product.rating.toFixed(1) + '</div><div class="pd-rating-stars">' + starString(product.rating) + "</div><div>" + total + " review" + (total === 1 ? "" : "s") + "</div></div>";
        html += "<div>";
        for (var s = 5; s >= 1; s--) {
            var pct = total ? Math.round((counts[s - 1] / total) * 100) : 0;
            html += '<div class="pd-bar-row"><span>' + s + "★</span><div class=\"pd-bar-track\"><div class=\"pd-bar-fill\" style=\"width:" + pct + '%"></div></div><span>' + counts[s - 1] + "</span></div>";
        }
        html += "</div></div>";

        product.reviews.forEach(function (r) {
            html += '<div class="pd-review-card">';
            html += '<div class="pd-review-head"><span><span class="pd-review-name">' + escapeHtml(r.customerName) + "</span>" +
                (r.verifiedPurchase ? '<span class="pd-verified-badge">✔ Verified Purchase</span>' : "") + "</span>" +
                '<span class="pd-review-date">' + escapeHtml(r.date) + "</span></div>";
            html += '<div class="pd-review-stars">' + starString(r.rating) + "</div>";
            html += "<p>" + escapeHtml(r.review) + "</p>";
            html += "</div>";
        });

        el.innerHTML = html;
    }

    // ---------------- Related products ----------------
    function renderRelated(product) {
        var el = document.getElementById("pdRelated");
        var related = window.VPW_getRelatedProducts(product, 4);

        if (!related.length) {
            el.innerHTML = "";
            return;
        }

        var html = '<h2 class="pd-section-title">You May Also Like</h2><section class="products">';
        related.forEach(function (p) {
            var img = (p.images && p.images[0]) || "";
            var priceLabel = p.priceOnRequest ? "On Request" : formatINR(p.price);
            html += '<div class="product-card" data-related-slug="' + escapeHtml(p.slug) + '" style="cursor:pointer;">' +
                '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' +
                "<h2>" + escapeHtml(p.name) + "</h2>" +
                '<p class="description">' + escapeHtml(p.description) + "</p>" +
                '<p class="price">' + priceLabel + "</p>" +
                (p.priceOnRequest
                    ? '<a href="contact.html" onclick="event.stopPropagation()"><button type="button">Contact for Price</button></a>'
                    : '<button type="button" onclick="event.stopPropagation(); if(typeof addToCart===\'function\'){addToCart(\'' + p.name.replace(/'/g, "\\'") + "', " + p.price + ", '" + img + "');}\">Add to Cart</button>") +
                "</div>";
        });
        html += "</section>";
        el.innerHTML = html;

        el.querySelectorAll(".product-card").forEach(function (card) {
            card.addEventListener("click", function (e) {
                if (e.target.closest("button, a")) return;
                window.location.href = "/product/" + card.getAttribute("data-related-slug");
            });
        });
    }

    // ---------------- Not found ----------------
    function renderNotFound() {
        document.getElementById("notFoundState").style.display = "block";
        document.getElementById("pdWrap").style.display = "none";
        document.getElementById("breadcrumbBar").innerHTML =
            '<a href="/index.html">Home</a><span class="sep">→</span><span class="current">Product not found</span>';
        document.title = "Product Not Found | Vimal Pets World";
    }

    // ---------------- Init ----------------
    function init() {
        var slug = getSlugFromURL();
        var product = slug ? window.VPW_getProductBySlug(slug) : null;

        if (!product) {
            renderNotFound();
            return;
        }

        document.title = product.name + " | Vimal Pets World";
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", product.description);

        document.getElementById("pdWrap").style.display = "grid";
        document.getElementById("notFoundState").style.display = "none";

        renderBreadcrumb(product);
        renderGallery(product);
        renderInfo(product);
        renderTabs(product);
        renderReviews(product);
        renderRelated(product);

        if (typeof window.updateCartBadge === "function") window.updateCartBadge();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
