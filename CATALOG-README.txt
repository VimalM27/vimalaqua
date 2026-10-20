VIMAL CATALOGUE UPGRADE: what is in this package
=================================================
NEW FILES (copy into your project)
  js/vpw-catalog.js    shared logic: cards, search, filters, sort, count, empty state, cart prices
  js/product-meta.js   YOUR control file: stock, price, brand, keywords, createdAt for each product
  css/vpw-catalog.css  card layout (aligned cards, 2 columns on phones) + filter bar look

UPDATED PAGES (each only gains 1 CSS line + 2-3 script lines; nothing else changed)
  dogs, cats, birds, fish, small-pets, aquariums, accessories, foods, plants, new, new-arrivals,
  index, cart, product, search-results (now the global Search + Browse page),
  and all 82 colourful toy collection pages.

TO ADD THE CODE TO ANY OTHER COLLECTION PAGE BY HAND
  In <head>, before </head>:
      <link rel="stylesheet" href="css/vpw-catalog.css?v=1">
  Before </body> (after the page's other scripts):
      <script src="js/products-data.js"></script>
      <script src="js/product-meta.js"></script>
      <script src="js/vpw-catalog.js"></script>
  (If the page already loads products-data.js, do not add it twice.)

HOW IT DECIDES WHAT TO SHOW
  Price      products-data.js, overridden by product-meta.js. Shown as Rs 1,200 style (Indian grouping).
  Stock      product-meta.js "stock" number (0 = Out of Stock, 1+ = In Stock). If you do not set one,
             the existing "availability" in products-data.js is used.
             Items that are not in products-data.js (the sample toys) show "Contact to Confirm".
  Button     In Stock -> Add to Cart | Out of Stock -> disabled | no price -> Contact for Price |
             not confirmed -> Enquire Now (both open WhatsApp with the product name filled in).
  Newest     uses createdAt from product-meta.js. The option only appears once at least one product
             has a date, so it never sorts by name by mistake.
  Cart       prices are saved as numbers from the same catalogue; old saved carts are corrected.

CONFIG (optional, put before the script tags):
  <script>window.VPW_CONFIG={ unlisted:'cart', whatsapp:'917845452727' };</script>
  unlisted:'cart' lets products that are not in products-data.js be added to cart (default is 'enquire').
