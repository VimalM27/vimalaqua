BILL / INVOICE: what is in this package
  bill.html, css/bill.css, js/bill.js        the bill page (logo, customer, products, quantity, rate, amount, total in words)
  js/vendor/html2pdf.bundle.min.js           PDF maker, hosted on your own site (MIT licence), loaded only when Download is clicked
  js/my-orders.js, js/admin-orders.js        updated: "Download bill" button on every order, and a link in the thank-you message

HOW IT WORKS
  The bill is built from the real order in the database, so it always matches My Orders.
  It shows PAID only when payment is confirmed; otherwise PAYMENT PENDING / PAY ON DELIVERY / PAY AT PICKUP.
  Cancelled and refunded orders show CANCELLED / REFUNDED.
  Customers can only open their own bills. You (admin) can open any bill from the order panel.

YOUR BUSINESS DETAILS (optional): add before the script tags on bill.html
  <script>window.VPW_BILL = { gstin: 'YOUR-GSTIN', address: 'Your full shop address', phone: '+91 78 4545 2727', email: 'vimal@vimal27.in', website: 'www.vimal27.in' };</script>
  GSTIN is only printed if you add it. Without it the document is a plain bill, not a GST tax invoice.
