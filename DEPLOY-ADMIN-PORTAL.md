# Vimal27 — Single-Owner Admin Portal: findings, install & deployment checklist

## 1. What I found in your project (inspection)
| Area | Finding |
|---|---|
| Architecture | Static HTML/CSS/JS site on **Vercel** (no backend, no `api/` folder, no package.json). Data in **Supabase**; product catalogue is a static file `js/products-data.js` (156 items). |
| Customer auth | Supabase Auth in the browser (`js/auth.js`, `supabaseClient.js`). |
| Existing admin | ~10 `admin-*.html` pages. "Admin" = a Supabase user listed in table `user_roles` (role='admin'); the check happens **in browser JavaScript** + Row-Level-Security (`vp_is_admin()`). Page HTML itself is public. Several admin pages are near-duplicate copies. |
| Database | Supabase tables: `vp_orders`, `vp_order_items`, `vp_order_events`, `vp_order_requests`, `profiles` (sellers), `products` (partner products), `payments` (seller subscriptions), `user_roles`; SQL functions `vp_admin_set_status / set_payment / set_tracking / add_note`. |
| Payments | **No Razorpay exists in the code.** Checkout uses manual UPI + admin verification. I did not add Razorpay (you asked to preserve it; there is nothing to preserve). |
| Gap vs your spec | No server-side auth, no hashed admin password, no HTTP-only cookies, no rate limiting, no audit log, no single-owner constraint → so a **new backend was required**. |

## 2. What I built (new files only; nothing replaced unnecessarily)
```
api/admin/[...route].js     one Vercel function: all /api/admin/* + protected page shell
api/toys-content.js         PUBLIC read-only: published Toys content (no secrets)
server/                     auth, sessions, rate-limit, CSRF, routes, CMS validator
server/admin-ui/            dashboard UI — served ONLY after login (not a public file)
supabase-admin-portal.sql   new tables (RLS locked), single-owner constraint, storage bucket
scripts/init-owner.js       one-time owner creation (run on YOUR computer)
scripts/reset-owner-password.js   owner-controlled recovery (run on YOUR computer)
js/toys-defaults.js         default Toys content (single source of truth)
js/toys-redesign.js, css/toys-redesign.css, toys.html   Toys page now renders from CMS
vercel.json                 MERGED with yours (rewrites for /admin/*, function config, blocks)
package.json                one dependency: @node-rs/argon2
tests/                      28 automated security/API tests + local dev harness
```
**Reused, not duplicated:** your `vp_orders`/`products`/`profiles`/`payments` tables and your existing SQL functions (order status, payment verification, tracking). Only **new** tables are `vp_admin_*` and `vp_page_content`.

**Security design:** Argon2id (64 MiB, t=3) · random 256-bit session token in `__Host-` cookie (HttpOnly, Secure, SameSite=Strict); only its SHA-256 is stored · 2 h idle / 12 h absolute expiry · max 5 sessions · server-side logout revocation · 5 failed logins/IP or 10/account per 15 min → 429 · constant-time "unknown user" path · Origin check + per-session CSRF token on every write · single-owner enforced by `CHECK(id=1)` + trigger · all new tables RLS-on with no policies (browser can't touch them) · audit log + login log · strict CSP on admin pages · no registration route exists · fails closed if env vars missing.

## 3. Deployment checklist (do in this order)
1. **Back up** your project and Supabase (Database → Backups).
2. **Copy** these into your project root (merge folders): `api/ server/ scripts/ tests/ js/toys-defaults.js js/toys-redesign.js css/toys-redesign.css toys.html package.json supabase-admin-portal.sql DEPLOY-ADMIN-PORTAL.md`. **Merge `vercel.json`**: I've included the merged file (your 19 redirects, rewrite and headers are kept) — replace yours with it.
3. **Supabase → SQL Editor:** paste and run `supabase-admin-portal.sql` once.
4. **Vercel → Project → Settings → Environment Variables** (Production; mark Sensitive; **never** prefix with `NEXT_PUBLIC_`/`VITE_`):
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Settings → API → **service_role** key (secret!)
   - `ADMIN_SESSION_SECRET` = 48+ random chars (`node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"`)
   - `ADMIN_ALLOWED_ORIGINS` = `https://vimal27.in,https://www.vimal27.in`
5. **Create the owner (once, on your own computer, not on the website):**
   ```
   npm install
   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/init-owner.js
   ```
   Enter username, email, and a strong password (min 12 chars, hidden). It refuses to run if an owner already exists, and the database itself rejects a second one. Close the terminal afterwards (the key is in your shell history — clear it, or use a throwaway shell).
6. **Deploy** (git push). Then open `https://vimal27.in/admin/login`.
7. **Verify (10 min):**
   - [ ] `/admin`, `/admin/orders`, `/admin/toys-page` etc. while signed out → redirect to login.
   - [ ] `https://vimal27.in/server/admin-ui/admin.js`, `/scripts/init-owner.js`, `/supabase-admin-portal.sql` → redirect to `/` (not downloadable).
   - [ ] Wrong password 5× → "Too many attempts" message.
   - [ ] Login works; dashboard numbers match Supabase; open an order, change status/payment on a **test order**.
   - [ ] Toys Page: edit heading → **Preview** (new tab, gold banner) → **Publish** → live page updates within ~30 s; signed-out `?preview=1` shows nothing special.
   - [ ] Sign out, press Back → still redirected.
   - [ ] Browser dev-tools → Application → Cookies: `__Host-v27_admin` is HttpOnly + Secure.
   - [ ] Public site, cart, checkout, navbar unchanged.
8. **After you're satisfied** (optional hardening): in Supabase run `delete from public.user_roles where role='admin';` so the portal is the *only* admin. (Old `admin-*.html` pages then stop working — intended.)
9. **Rotate** the service-role key if it was ever pasted in chat/email.

## 4. Password recovery (owner-controlled)
There is deliberately no "forgot password" email link (it would be a second way in). If you forget the password: run `node scripts/reset-owner-password.js` on your computer with the service-role key. It sets a new Argon2id hash and signs out every session. Whoever controls your Supabase/Vercel accounts controls the portal — **enable 2-step verification on both, plus GitHub.**

## 5. Honest limitations / things to verify
- **Not tested against your real Supabase/Vercel** (my sandbox is offline). I ran 28 tests against an in-memory database through real HTTP, plus a browser test of login → every page → Toys edit → preview → publish → live. Do step 7 on production before trusting it.
- **Seller approve/reject** calls your existing `update_seller_status` SQL function, which isn't in your repo, so I couldn't see its rules. Test with a dummy application. Its status words (`approved`/`rejected`) are assumed.
- **Legacy admin pages:** I redirect `admin-dashboard/orders/products/payments/sellers/seller-applications.html` to the new portal. I did **not** replace `admin-security`, `admin-tools`, `admin-moderation`, `admin-careers`, `admin-partner-details`; they still use the old client-side check (protected only by RLS). Phase 2 candidates.
- **Catalogue products** (`products-data.js`) are still edited in code; the portal shows them read-only. Partner products (database) can be hidden/shown.
- "Popular Picks" has no sales data to rank by: Automatic = available toys, newest first; Manual = your ticked products.
- Dashboard reads up to 20,000 orders per load — fine for now; move to SQL aggregates if you grow.
- Public Toys content is CDN-cached ~30 s. Image uploads go to a public Supabase bucket `site-media` (JPG/PNG/WebP/GIF ≤3 MB, content-sniffed; SVG refused).
- **Separate security issue:** your project zip contains `android-app/release.keystore` and `release-keystore-base64.txt`. If this repo is on GitHub (especially public), remove them from git history and treat that signing key as compromised.
