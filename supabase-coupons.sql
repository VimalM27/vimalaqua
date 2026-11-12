-- =====================================================================
-- Vimal Pets & Toys: festive COUPONS (applied at checkout, checked on the server)
-- Run this ONCE in Supabase > SQL Editor, AFTER supabase-orders.sql. Safe to re-run.
-- =====================================================================

-- 1. Coupon table. Customers can NOT read it (codes cannot be listed from the browser).
--    Only admins can manage it; customers use the functions below.
create table if not exists public.vp_coupons (
  code          text primary key check (code = upper(code)),
  description   text,
  percent_off   numeric(5,2) check (percent_off > 0 and percent_off <= 100),
  flat_off      numeric(10,2) check (flat_off > 0),
  max_discount  numeric(10,2),
  min_order     numeric(10,2) not null default 0,
  categories    text[],
  exclude_live  boolean not null default false,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  per_user_limit int not null default 1,
  total_limit   int,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (percent_off is not null or flat_off is not null),
  check (ends_at > starts_at)
);
comment on column public.vp_coupons.categories is 'Catalogue categories it applies to (Dogs, Cats, Birds, Small Pets, Fish, Aquariums, Plants, Pet Foods, Accessories, Toys). NULL = every category';
comment on column public.vp_coupons.max_discount is 'Upper limit on a percentage discount';
comment on column public.vp_coupons.exclude_live is 'true = live pets and fish never get the discount';
comment on column public.vp_coupons.total_limit is 'NULL = unlimited redemptions overall';
alter table public.vp_coupons enable row level security;
drop policy if exists "vp coupons admin" on public.vp_coupons;
create policy "vp coupons admin" on public.vp_coupons for all using (public.vp_is_admin()) with check (public.vp_is_admin());

-- 2. Orders remember which coupon was used and how much it took off
alter table public.vp_orders add column if not exists coupon_code text;
alter table public.vp_orders add column if not exists discount numeric(10,2) not null default 0;

-- 3. The one place the discount is worked out (used by the preview AND when placing the order)
create or replace function public.vp_coupon_calc(p_code text, p_items jsonb, p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c public.vp_coupons; v_code text := upper(trim(coalesce(p_code,'')));
  i jsonb; v_qty int; v_price numeric; v_line numeric;
  v_sub numeric := 0; v_elig numeric := 0; v_disc numeric := 0; v_used int;
begin
  if v_code = '' then return jsonb_build_object('ok', false, 'message', 'Enter a coupon code.'); end if;
  select * into c from public.vp_coupons where code = v_code and active;
  if not found then return jsonb_build_object('ok', false, 'message', 'This coupon code is not valid.'); end if;
  if now() < c.starts_at then
    return jsonb_build_object('ok', false, 'message', 'This offer has not started yet. It starts on ' || to_char(c.starts_at at time zone 'Asia/Kolkata', 'DD Mon YYYY') || '.'); end if;
  if now() > c.ends_at then return jsonb_build_object('ok', false, 'message', 'This offer has ended.'); end if;

  for i in select * from jsonb_array_elements(p_items) loop
    v_qty := nullif(i->>'qty','')::int; v_price := nullif(i->>'unit_price','')::numeric;
    if v_qty is null or v_price is null or v_qty < 1 or v_price <= 0 then continue; end if;
    v_line := v_qty * v_price; v_sub := v_sub + v_line;
    if (c.categories is null or exists (select 1 from unnest(c.categories) x where lower(x) = lower(coalesce(i->>'category',''))))
       and not (c.exclude_live and coalesce((i->>'is_live')::boolean, false)) then
      v_elig := v_elig + v_line;
    end if;
  end loop;

  if p_user is not null then
    select count(*) into v_used from public.vp_orders
      where user_id = p_user and coupon_code = c.code and order_status not in ('cancelled','refunded','refund_pending');
    if v_used >= c.per_user_limit then return jsonb_build_object('ok', false, 'message', 'You have already used this code.'); end if;
  end if;
  if c.total_limit is not null then
    select count(*) into v_used from public.vp_orders
      where coupon_code = c.code and order_status not in ('cancelled','refunded','refund_pending');
    if v_used >= c.total_limit then return jsonb_build_object('ok', false, 'message', 'This offer is fully redeemed.'); end if;
  end if;
  if v_elig <= 0 then
    return jsonb_build_object('ok', false, 'message', 'This code does not apply to the items in your cart.' ||
      case when c.categories is not null then ' It works on: ' || array_to_string(c.categories, ', ') || '.' else '' end); end if;
  if v_sub < c.min_order then
    return jsonb_build_object('ok', false, 'message', 'Add Rs ' || round(c.min_order - v_sub) || ' more to use this code (minimum order Rs ' || round(c.min_order) || ').'); end if;

  if c.percent_off is not null then v_disc := v_elig * c.percent_off / 100; else v_disc := c.flat_off; end if;
  if c.max_discount is not null then v_disc := least(v_disc, c.max_discount); end if;
  v_disc := round(greatest(least(v_disc, v_elig, v_sub - 1), 0), 2);  -- never discount an order to zero
  return jsonb_build_object('ok', true, 'code', c.code, 'discount', v_disc, 'subtotal', v_sub,
                            'description', c.description, 'message', 'Coupon ' || c.code || ' applied.');
end $$;

-- 4. Customer preview at checkout (changes nothing, answers "what would I save?")
create or replace function public.vp_quote_coupon(p_code text, p_items jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Please log in to use a coupon'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 40 then raise exception 'Your cart is empty or too large'; end if;
  return public.vp_coupon_calc(p_code, p_items, auth.uid());
end $$;

-- 5. Place order, now with an optional coupon. The old 4-argument version is replaced;
--    calls that send no coupon keep working.
drop function if exists public.vp_place_order(jsonb,jsonb,text,text);
create or replace function public.vp_place_order(p_customer jsonb, p_items jsonb, p_payment_method text, p_reference text default null, p_coupon text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_order public.vp_orders;
  v_item jsonb;
  v_sub numeric(10,2) := 0;
  v_live boolean := false;
  v_qty int; v_price numeric;
  v_ref text := upper(regexp_replace(coalesce(p_reference,''), '\s', '', 'g'));
  v_code text := upper(trim(coalesce(p_coupon,'')));
  v_calc jsonb; v_disc numeric(10,2) := 0;
begin
  if v_user is null then raise exception 'Please log in to place an order'; end if;
  if p_payment_method not in ('upi','online') then raise exception 'Cash on delivery is not available. Please pay online (UPI / bank transfer).'; end if;
  if p_payment_method = 'upi' then
    if v_ref !~ '^[A-Z0-9]{8,30}$' then raise exception 'Enter the UPI transaction ID / UTR (8 to 30 letters or numbers) from your payment.'; end if;
    if exists (select 1 from public.vp_orders where upper(payment_reference) = v_ref and order_status not in ('cancelled','refunded')) then
      raise exception 'This transaction ID has already been used on another order.'; end if;
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 40 then raise exception 'Your cart is empty or too large'; end if;
  if coalesce(trim(p_customer->>'name'),'') = '' or coalesce(trim(p_customer->>'address'),'') = '' then raise exception 'Name and address are required'; end if;
  if (p_customer->>'phone') !~ '^[0-9]{10}$' then raise exception 'Enter a valid 10-digit mobile number'; end if;
  if (select count(*) from public.vp_orders where user_id = v_user and created_at > now() - interval '1 day') >= 20 then raise exception 'Too many orders today. Please contact us.'; end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'qty')::int; v_price := (v_item->>'unit_price')::numeric;
    if v_qty is null or v_qty not between 1 and 50 or v_price is null or v_price <= 0 or v_price > 1000000 then raise exception 'Invalid item in cart'; end if;
    if coalesce(trim(v_item->>'name'),'') = '' then raise exception 'Invalid item name'; end if;
    v_sub := v_sub + v_qty * v_price;
    if coalesce((v_item->>'is_live')::boolean, false) then v_live := true; end if;
  end loop;

  -- coupon: re-checked here on the server, so the browser can never set its own discount
  if v_code <> '' then
    perform 1 from public.vp_coupons where code = v_code for update;
    v_calc := public.vp_coupon_calc(v_code, p_items, v_user);
    if not (v_calc->>'ok')::boolean then raise exception '%', v_calc->>'message'; end if;
    v_disc := least((v_calc->>'discount')::numeric, v_sub - 1);
    if v_disc < 0 then v_disc := 0; end if;
  end if;

  insert into public.vp_orders(user_id, customer_name, phone, email, address, city, pincode, fulfilment, payment_method, payment_status, payment_reference, subtotal, discount, coupon_code, total, customer_note)
  values (v_user, left(trim(p_customer->>'name'),120), p_customer->>'phone', left(p_customer->>'email',160), left(trim(p_customer->>'address'),400),
          left(p_customer->>'city',80), left(p_customer->>'pincode',10), case when v_live then 'live_arrangement' else 'shipping' end,
          p_payment_method, case when v_ref <> '' then 'pending' else 'unpaid' end, nullif(v_ref,''), v_sub, v_disc, nullif(v_code,''), v_sub - v_disc, left(p_customer->>'note',500))
  returning * into v_order;

  insert into public.vp_order_items(order_id, product_slug, name, category, qty, unit_price, is_live, image)
  select v_order.id, left(i->>'slug',120), left(i->>'name',200), left(i->>'category',60), (i->>'qty')::int, (i->>'unit_price')::numeric,
         coalesce((i->>'is_live')::boolean,false), left(i->>'image',300)
  from jsonb_array_elements(p_items) i;

  perform public.vp_log(v_order.id, 'placed', null, 'pending_payment', 'Order received successfully' || case when v_disc > 0 then '. Coupon ' || v_code || ' saved Rs ' || v_disc else '' end, 'customer', true);
  if v_ref <> '' then perform public.vp_log(v_order.id, 'payment', 'unpaid', 'pending', 'Payment reference submitted: ' || v_ref || '. Verification in progress.', 'customer', true); end if;
  return jsonb_build_object('id', v_order.id, 'order_no', v_order.order_no, 'fulfilment', v_order.fulfilment);
end $$;

-- 6. Permissions: logged-in users only; the raw calculator is not callable from the browser
revoke all on function public.vp_coupon_calc(text,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.vp_quote_coupon(text,jsonb) from public, anon;
grant execute on function public.vp_quote_coupon(text,jsonb) to authenticated;
revoke all on function public.vp_place_order(jsonb,jsonb,text,text,text) from public, anon;
grant execute on function public.vp_place_order(jsonb,jsonb,text,text,text) to authenticated;

-- 7. Festive coupons (these match offers.html). Edit freely. Dates are India time.
insert into public.vp_coupons (code, description, percent_off, flat_off, max_discount, min_order, categories, exclude_live, starts_at, ends_at, per_user_limit) values
 ('DIWALI15',    'Diwali: 15% off, up to Rs 5,000',                15,   null, 5000, 0,    null,                                              false, timestamptz '2026-11-01 00:00:00+05:30', timestamptz '2026-11-11 23:59:59+05:30', 1),
 ('XMAS12',      'Christmas: 12% off toys, accessories, aquariums', 12,   null, 1500, 0,    array['Toys','Accessories','Aquariums'],           false, timestamptz '2026-12-15 00:00:00+05:30', timestamptz '2026-12-26 23:59:59+05:30', 1),
 ('NEWYEAR10',   'New Year: 10% off accessories and pet foods',     10,   null, 1000, 999,  array['Accessories','Pet Foods'],                  false, timestamptz '2026-12-28 00:00:00+05:30', timestamptz '2027-01-03 23:59:59+05:30', 1),
 ('PONGAL20',    'Pongal: 20% off pet food',                        20,   null, 1000, 0,    array['Pet Foods'],                                false, timestamptz '2027-01-12 00:00:00+05:30', timestamptz '2027-01-17 23:59:59+05:30', 1),
 ('REPUBLIC300', 'Republic Day: Rs 300 off above Rs 2,000',         null, 300,  null, 2000, array['Pet Foods','Accessories','Toys'],           false, timestamptz '2027-01-24 00:00:00+05:30', timestamptz '2027-01-26 23:59:59+05:30', 1),
 ('HOLI20',      'Holi: 20% off toys',                              20,   null, 1000, 0,    array['Toys'],                                     false, timestamptz '2027-03-20 00:00:00+05:30', timestamptz '2027-03-23 23:59:59+05:30', 1),
 ('PUTHANDU',    'Tamil New Year: 10% off aquarium range',          10,   null, 2000, 0,    array['Aquariums','Fish','Plants','Accessories'],  false, timestamptz '2027-04-12 00:00:00+05:30', timestamptz '2027-04-16 23:59:59+05:30', 1)
on conflict (code) do nothing;
