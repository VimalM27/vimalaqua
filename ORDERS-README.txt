VIMAL ORDERS: setup in 5 steps
===============================
1. Supabase > SQL Editor > paste all of supabase-orders.sql > Run. (Safe to run again.)
2. Make yourself admin: in the SQL Editor run
     insert into public.user_roles(user_id, role)
     select id, 'admin' from auth.users where email = 'YOUR-LOGIN-EMAIL' on conflict do nothing;
   (Your admin-dashboard.html already uses this same user_roles table.)
3. Copy every file in this folder into your project, replacing: cart.html, login.html, admin-dashboard.html, js/auth.js.
   New files: my-orders.html, order-checkout.html, admin-orders.html, css/orders.css,
   js/vp-orders-common.js, js/my-orders.js, js/order-checkout.js, js/admin-orders.js.
4. order-checkout.html also loads js/products-data.js, js/product-meta.js and js/vpw-catalog.js
   (from the catalogue upgrade). Install that package first.
5. Test: log in as a customer > add to cart > Proceed to Checkout > Place order > My Orders.
   Then log in as admin > admin-orders.html.

WHAT EACH PAGE DOES
  my-orders.html       customers: orders, products, quantity, total, order status AND payment status shown separately,
                       tracking when dispatched, request cancellation (only while eligible), report damaged/missing/wrong item
                       (only after dispatch), contact support (in the site, or WhatsApp with the order number filled in),
                       aquarium service requests with Requested > Confirmed > Scheduled > Completed.
  order-checkout.html  turns the cart into a real order. ONLINE PAYMENT ONLY (UPI / bank transfer). The customer pays, enters the transaction ID (UTR), and the order waits as 'payment under verification'.
  admin-orders.html    protected dashboard: filters, payment control, status control, tracking, live-pet arrangement,
                       customer requests, service requests, history, CSV export.

RULES BUILT IN (enforced by the database, not just the screen)
  - Cash on delivery and pay-at-pickup are REMOVED. The database rejects them for every new order.
  - Payment is never marked paid at checkout. Admin verifies the transaction ID in the bank/UPI app, then marks it paid.
  - The same transaction ID cannot be used on two orders.
  - No order can be Confirmed until payment is Paid.
  - Live pets and fish: availability must be confirmed first; they use Out for delivery, not parcel Shipped.
  - Shipped needs tracking details. Only valid next statuses are allowed.
  - Customers can only read their own orders and cannot change status or payment.
  - Cancelling a paid order moves the payment to Refund pending; Refunded needs the order to be Refund pending first.

CHANGE THE UPI ID
  Edit upiId and payeeName in the small <script> above order-checkout.js in order-checkout.html. IMPORTANT: confirm it is YOUR receiving UPI ID.

PAYMENT GATEWAY LATER (Razorpay etc.)
  Set  window.VPW_ORDERS = { onlinePayments: true }  on order-checkout.html, then have the provider's webhook call a
  server function that sets payment_status = 'paid' with the provider's payment ID. Never mark paid from the browser.
