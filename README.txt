VIMAL PETS & TOYS — MULTI-PAGE ADMIN PANEL

Files
- admin-dashboard.html
- admin-sellers.html
- admin-products.html
- admin-orders.html
- admin-payments.html
- admin-seller-applications.html
- admin-moderation.html
- admin-tools.html
- admin-security.html

INSTALL
1. Make a backup of your current admin dashboard file and related login page.
2. Copy these HTML files into the same website root folder where the current admin dashboard and login.html live.
3. Ensure the existing images/vimallogo.png asset is available at that relative path.
4. Open admin-dashboard.html after signing in. Sidebar items open separate HTML pages.
5. Keep the current Supabase project and publishable key configuration consistent with your existing setup. Never put a service-role key in frontend files.

SECURITY NOTE
Each page retains the existing Supabase sign-in and user_roles role check. That frontend gate is not a substitute for database Row Level Security. Confirm RLS policies and the admin-role grant process before deploying. These files have not been tested against the live database or deployed to vimal27.in.

DATA NOTE
Each page uses the existing dashboard data loader and schema assumptions. Tables/columns unavailable in the database may display empty results or errors; the order/payment system still depends on your actual schema and records.
