-- =====================================================================
-- VIMAL: AUTO-SEND BILL LINK TO CUSTOMER'S PHONE  (run ONCE in SQL Editor, safe to re-run)
-- Needs supabase-orders.sql already run.
-- =====================================================================

-- 1. Private, unguessable link token per order (64 random hex chars)
alter table public.vp_orders add column if not exists invoice_token text;
update public.vp_orders set invoice_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
  where invoice_token is null;
alter table public.vp_orders alter column invoice_token
  set default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
alter table public.vp_orders alter column invoice_token set not null;
create unique index if not exists vp_orders_invoice_token_key on public.vp_orders(invoice_token);

-- 2. Open a bill from the SMS/WhatsApp link WITHOUT login (token = the key)
create or replace function public.vp_get_invoice(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o public.vp_orders;
begin
  if p_token is null or length(p_token) < 40 then return null; end if;
  select * into o from public.vp_orders where invoice_token = p_token;
  if not found then return null; end if;
  return jsonb_build_object(
    'order', to_jsonb(o) - 'invoice_token' - 'user_id' - 'admin_note',
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.vp_order_items i where i.order_id = o.id), '[]'::jsonb));
end $$;
revoke all on function public.vp_get_invoice(text) from public;
grant execute on function public.vp_get_invoice(text) to anon, authenticated;

-- 3. Log of every message attempt (admins can read; only the server writes)
create table if not exists public.vp_invoice_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vp_orders(id) on delete cascade,
  event text not null default 'placed',          -- placed | paid | resend
  channel text not null,                         -- whatsapp | sms
  status text not null,                          -- sent | failed | skipped
  detail text,
  created_at timestamptz not null default now()
);
alter table public.vp_invoice_messages enable row level security;
drop policy if exists "invoice msgs admin read" on public.vp_invoice_messages;
create policy "invoice msgs admin read" on public.vp_invoice_messages for select using (public.vp_is_admin());

-- 4. Private settings (no policies = nobody can read them from the browser)
create table if not exists public.vp_private_settings (key text primary key, value text not null);
alter table public.vp_private_settings enable row level security;

-- 5. Trigger: tell the Edge Function when an order is placed / marked paid.
--    pg_net sends it AFTER the order transaction commits, and a failure here can never block an order.
create extension if not exists pg_net with schema extensions;

create or replace function public.vp_notify_invoice() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare u text; s text; ev text;
begin
  ev := case when tg_op = 'INSERT' then 'placed' else 'paid' end;
  select value into u from public.vp_private_settings where key = 'invoice_fn_url';
  select value into s from public.vp_private_settings where key = 'invoice_fn_secret';
  if u is null or s is null then return new; end if;
  begin
    perform net.http_post(url := u,
      headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret', s),
      body := jsonb_build_object('order_id', new.id, 'event', ev));
  exception when others then
    insert into public.vp_invoice_messages(order_id, event, channel, status, detail)
    values (new.id, ev, 'none', 'failed', left(sqlerrm, 300));
  end;
  return new;
end $$;

drop trigger if exists vp_notify_invoice_ins on public.vp_orders;
create trigger vp_notify_invoice_ins after insert on public.vp_orders
  for each row execute function public.vp_notify_invoice();

drop trigger if exists vp_notify_invoice_paid on public.vp_orders;
create trigger vp_notify_invoice_paid after update of payment_status on public.vp_orders
  for each row when (new.payment_status = 'paid' and old.payment_status is distinct from 'paid')
  execute function public.vp_notify_invoice();

-- 6. AFTER deploying the Edge Function, run these two lines once (replace the secret with your own long random text):
-- insert into public.vp_private_settings(key,value) values
--   ('invoice_fn_url',   'https://pwgjuwhmbntwjnjzbodb.supabase.co/functions/v1/send-invoice'),
--   ('invoice_fn_secret','PUT-A-LONG-RANDOM-SECRET-HERE')
-- on conflict (key) do update set value = excluded.value;
