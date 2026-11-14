# Auto-send the bill link to the customer's phone

**What happens:** customer places an order → within seconds their phone gets a WhatsApp message (or normal SMS if WhatsApp isn't set up / fails) with a link. Tapping it opens their bill; **Download PDF** is one tap. No login needed. When you mark the payment *Paid*, they get a second message and the same link now shows **PAID**.

A browser page cannot send messages safely, so this uses a small server function (Supabase Edge Function) plus a WhatsApp or SMS provider. I could not test against real providers from here, so do the test in step 6.

## 1. Choose how to send (you can set up one or both)

**WhatsApp (recommended, cheapest per message).** WhatsApp Cloud API from Meta (developers.facebook.com → your app → WhatsApp). You need a business number, a permanent access token and the *Phone number ID*. Create a **Utility** message template named e.g. `vimal_invoice`, language English, body:

```
Hi {{1}}, thank you for your order {{2}} at Vimal Pets & Toys. Download your bill here: {{3}}
```
Meta must approve the template (usually minutes to a day). Business-initiated messages can only be sent with an approved template.

**Normal SMS (India).** Use MSG91 (or similar). TRAI rules require DLT registration of your sender ID and message template. Template text (variables must be named `name`, `order`, `link`):
```
Hi ##name##, thank you for your order ##order## at Vimal Pets & Toys. Download your bill: ##link##
```
Create a *Flow* in MSG91 with this template and note its Template ID and your Auth Key. Check MSG91's current docs if their API fields changed.

## 2. Database
Supabase → SQL Editor → run `supabase-invoice-link.sql` (safe to re-run).

## 3. Deploy the function (Supabase CLI)
Copy the `supabase/functions/send-invoice` folder into your project, then:
```
supabase functions deploy send-invoice --no-verify-jwt
supabase secrets set WEBHOOK_SECRET="<long random text>" SITE_URL="https://www.vimal27.in" \
  WA_TOKEN="<meta token>" WA_PHONE_ID="<phone number id>" WA_TEMPLATE="vimal_invoice" \
  MSG91_AUTHKEY="<authkey>" MSG91_TEMPLATE_ID="<template id>"
```
Leave out the WA_* lines to use SMS only, or the MSG91_* lines to use WhatsApp only.
`--no-verify-jwt` is needed because the database trigger has no login; the function instead checks `WEBHOOK_SECRET` (or that the caller is an admin).

## 4. Connect the trigger
Back in the SQL Editor, run the last block of the SQL file (the `insert into vp_private_settings…`), using the **same** secret as `WEBHOOK_SECRET`.

## 5. Website files
Replace `js/bill.js` (and the duplicate `bill.js` in the project root, if you keep it). `bill.html` needs no change.

## 6. Test
Place a test order with your own phone number. Check:
- message arrives; link opens the bill without logging in; Download PDF works.
- if nothing arrives: `select * from vp_invoice_messages order by created_at desc;` shows what each provider answered.
Admins also get a **📲 Send to customer's phone** button on any bill (login required) to resend.

## Good to know
- The link contains a 64-character random key. Anyone who has the link can see that bill (name, address, items), so it is only sent to the order's phone. To disable a link: `update vp_orders set invoice_token = replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','') where order_no='VM27xxx';`
- Each automatic message is sent once per order per event. Providers charge per message.
- To stop the second "paid" message: `drop trigger vp_notify_invoice_paid on public.vp_orders;`
- The message has no amount on purpose; the bill is the source of truth.
