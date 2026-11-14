// Supabase Edge Function: sends the bill link to the customer's phone (WhatsApp first, SMS fallback).
// Deploy:  supabase functions deploy send-invoice --no-verify-jwt
// Callers: (a) the database trigger, with header x-webhook-secret   (b) a logged-in admin (Resend button on bill page)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const env = (k: string) => Deno.env.get(k) ?? "";
const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function isAdmin(req: Request): Promise<boolean> {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return false;
  const { data } = await sb.auth.getUser(jwt);
  if (!data?.user) return false;
  const { data: role } = await sb.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  return !!role;
}

async function log(order_id: string, event: string, channel: string, status: string, detail = "") {
  await sb.from("vp_invoice_messages").insert({ order_id, event, channel, status, detail: detail.slice(0, 400) });
}

async function sendWhatsApp(to: string, name: string, orderNo: string, link: string) {
  const token = env("WA_TOKEN"), phoneId = env("WA_PHONE_ID"), tpl = env("WA_TEMPLATE");
  if (!token || !phoneId || !tpl) return { ok: false, detail: "WhatsApp not configured" };
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "template",
      template: { name: tpl, language: { code: env("WA_LANG") || "en" },
        components: [{ type: "body", parameters: [
          { type: "text", text: name }, { type: "text", text: orderNo }, { type: "text", text: link }] }] },
    }),
  });
  const t = await r.text();
  return { ok: r.ok, detail: t };
}

async function sendSms(to: string, name: string, orderNo: string, link: string) {
  const key = env("MSG91_AUTHKEY"), tpl = env("MSG91_TEMPLATE_ID");
  if (!key || !tpl) return { ok: false, detail: "SMS not configured" };
  // MSG91 Flow API. The template variables must be named: name, order, link  (##name## ##order## ##link##)
  const r = await fetch("https://control.msg91.com/api/v5/flow", {
    method: "POST",
    headers: { authkey: key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ template_id: tpl, short_url: "0", recipients: [{ mobiles: to, name, order: orderNo, link }] }),
  });
  const t = await r.text();
  let ok = r.ok; try { ok = ok && JSON.parse(t).type !== "error"; } catch (_) { /* keep r.ok */ }
  return { ok, detail: t };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const secret = env("WEBHOOK_SECRET");
  const fromTrigger = !!secret && req.headers.get("x-webhook-secret") === secret;
  if (!fromTrigger && !(await isAdmin(req))) return json({ error: "Not allowed" }, 403);

  let body: { order_id?: string; event?: string; resend?: boolean } = {};
  try { body = await req.json(); } catch (_) { return json({ error: "Bad JSON" }, 400); }
  const event = body.resend ? "resend" : (body.event === "paid" ? "paid" : "placed");
  if (!body.order_id) return json({ error: "order_id required" }, 400);

  const { data: o } = await sb.from("vp_orders").select("id,order_no,customer_name,phone,invoice_token").eq("id", body.order_id).maybeSingle();
  if (!o) return json({ error: "Order not found" }, 404);

  // never send the same automatic message twice
  if (event !== "resend") {
    const { data: done } = await sb.from("vp_invoice_messages").select("id").eq("order_id", o.id).eq("event", event).eq("status", "sent").limit(1);
    if (done?.length) return json({ ok: true, skipped: "already sent" });
  }

  const digits = String(o.phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) { await log(o.id, event, "none", "failed", "Invalid phone number"); return json({ error: "Invalid phone" }, 422); }
  const to = "91" + digits;
  const site = (env("SITE_URL") || "https://www.vimal27.in").replace(/\/$/, "");
  const link = `${site}/bill.html?t=${o.invoice_token}`;
  const name = String(o.customer_name ?? "Customer").split(" ")[0].slice(0, 30);

  const wa = await sendWhatsApp(to, name, o.order_no, link);
  if (wa.ok) { await log(o.id, event, "whatsapp", "sent", wa.detail); return json({ ok: true, channel: "whatsapp" }); }
  await log(o.id, event, "whatsapp", env("WA_TOKEN") ? "failed" : "skipped", wa.detail);

  const sms = await sendSms(to, name, o.order_no, link);
  if (sms.ok) { await log(o.id, event, "sms", "sent", sms.detail); return json({ ok: true, channel: "sms" }); }
  await log(o.id, event, "sms", env("MSG91_AUTHKEY") ? "failed" : "skipped", sms.detail);

  return json({ ok: false, error: "Could not send by WhatsApp or SMS. See vp_invoice_messages." }, 502);
});
