/* Vimal27 SEO Phase 2 - Dynamic product SEO
   Updates title, description, canonical URL and Product structured data
   using the product information already loaded by products-data.js. */
(function () {
  "use strict";

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || null;
  }

  function esc(value) {
    return String(value || "").replace(/[<>&"']/g, function (c) {
      return {"<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;", "'":"&#39;"}[c];
    });
  }

  function findProduct() {
    var slug = getSlug();
    var list = window.VPW_PRODUCTS;
    if (!slug || !list) return null;

    if (Array.isArray(list)) {
      return list.find(function (p) {
        return p.id === slug || p.slug === slug;
      }) || null;
    }

    return list[slug] || null;
  }

  function addSchema(data) {
    var old = document.getElementById("vimalProductSchema");
    if (old) old.remove();

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "vimalProductSchema";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function updateSEO() {
    var slug = getSlug();
    var product = findProduct();
    if (!slug || !product) return;

    var name = product.name || product.title || slug.replace(/-/g, " ");
    var description = product.description ||
      ("Explore " + name + " at Vimal Pets & Toys. Check product details and availability.");
    var image = (product.images && product.images[0]) || product.image || "";
    var url = "https://vimal27.in/product.html?id=" + encodeURIComponent(slug);

    document.title = name + " | Vimal Pets & Toys";

    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description.slice(0, 160));

    var canonical = document.getElementById("dynamicCanonical");
    if (canonical) canonical.setAttribute("href", url);

    var schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "description": description,
      "url": url
    };

    if (image) {
      schema.image = image.indexOf("http") === 0
        ? image
        : "https://vimal27.in/" + image.replace(/^\/+/, "");
    }

    if (product.brand) {
      schema.brand = {"@type": "Brand", "name": product.brand};
    }

    if (product.price !== undefined && product.price !== null && product.price !== "") {
      schema.offers = {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": Number(product.price),
        "url": url,
        "availability": product.stock === 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock"
      };
    }

    addSchema(schema);
  }

  // products-data.js loads before this script in product.html.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateSEO);
  } else {
    updateSEO();
  }
})();
