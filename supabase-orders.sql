-- =====================================================================
-- Vimal Pets & Toys: customer orders, tracking, requests, admin control
-- Run this ONCE in Supabase > SQL Editor. Safe to re-run.
-- Uses new tables prefixed vp_ so it never touches your existing tables.
-- =====================================================================
create extension if not exists pgcrypto;

-- Admin roles (your admin-dashboard.html already uses this table) ------
create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;
drop policy if exists "vp read own role" on public.user_roles;
create policy "vp read own role" on public.user_roles for select using (user_id = auth.uid());

create or replace function public.vp_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- Tables ----------------------------------------------------------------
create sequence if not exists public.vp_order_seq start 1;

create table if not exists public.vp_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null default ('VM27' || lpad(nextval('public.vp_order_seq')::text, 3, '0')),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text,
  pincode text,
  fulfilment text not null default 'shipping' check (fulfilment in ('shipping','live_arrangement')),
  order_status text not null default 'pending_payment'
    check (order_status in ('pending_payment','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refund_pending','refunded')),
  payment_method text not null check (payment_method in ('cod','pay_at_pickup','upi','online')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','pending','paid','failed','refund_pending','refunded')),
  payment_reference text,
  paid_at timestamptz,
  subtotal numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  carrier text,
  tracking_number text,
  tracking_url text,
  estimated_delivery date,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  availability_confirmed boolean not null default false,
  arrangement_note text,
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vp_orders_user_idx on public.vp_orders(user_id, created_at desc);
create index if not exists vp_orders_status_idx on public.vp_orders(order_status);

create table if not exists public.vp_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vp_orders(id) on delete cascade,
  product_slug text,
  name text not null,
  category text,
  qty int not null check (qty between 1 and 50),
  unit_price numeric(10,2) not null check (unit_price > 0),
  line_total numeric(10,2) generated always as (qty * unit_price) stored,
  is_live boolean not null default false,
  image text
);
create index if not exists vp_items_order_idx on public.vp_order_items(order_id);

create table if not exists public.vp_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vp_orders(id) on delete cascade,
  kind text not null check (kind in ('placed','status','payment','tracking','arrangement','request','note')),
  from_value text,
  to_value text,
  note text,
  actor text not null default 'system',
  customer_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists vp_events_order_idx on public.vp_order_events(order_id, created_at);

create table if not exists public.vp_order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vp_orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('cancellation','damaged','missing','incorrect','support')),
  item_id uuid references public.vp_order_items(id) on delete set null,
  message text not null check (char_length(message) between 3 and 1000),
  status text not null default 'open' check (status in ('open','in_review','resolved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists vp_requests_order_idx on public.vp_order_requests(order_id);

create table if not exists public.vp_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service text not null check (service in ('setup','custom','maintenance','cleaning','other')),
  name text not null,
  phone text not null,
  address text,
  preferred_date date,
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'requested' check (status in ('requested','confirmed','scheduled','completed','cancelled')),
  scheduled_for timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row level security: customers read only their own rows; every write goes through the functions below
alter table public.vp_orders enable row level security;
alter table public.vp_order_items enable row level security;
alter table public.vp_order_events enable row level security;
alter table public.vp_order_requests enable row level security;
alter table public.vp_service_requests enable row level security;

drop policy if exists "vp orders read" on public.vp_orders;
create policy "vp orders read" on public.vp_orders for select using (user_id = auth.uid() or public.vp_is_admin());

drop policy if exists "vp items read" on public.vp_order_items;
create policy "vp items read" on public.vp_order_items for select using (
  exists (select 1 from public.vp_orders o where o.id = order_id and (o.user_id = auth.uid() or public.vp_is_admin())));

drop policy if exists "vp events read" on public.vp_order_events;
create policy "vp events read" on public.vp_order_events for select using (
  public.vp_is_admin() or (customer_visible and exists (select 1 from public.vp_orders o where o.id = order_id and o.user_id = auth.uid())));

drop policy if exists "vp requests read" on public.vp_order_requests;
create policy "vp requests read" on public.vp_order_requests for select using (user_id = auth.uid() or public.vp_is_admin());

drop policy if exists "vp service read" on public.vp_service_requests;
create policy "vp service read" on public.vp_service_requests for select using (user_id = auth.uid() or public.vp_is_admin());
drop policy if exists "vp service insert" on public.vp_service_requests;
create policy "vp service insert" on public.vp_service_requests for insert with check (user_id = auth.uid() and status = 'requested');

-- internal helper
create or replace function public.vp_log(p_order uuid, p_kind text, p_from text, p_to text, p_note text, p_actor text, p_visible boolean)
returns void language sql security definer set search_path = public as $$
  insert into public.vp_order_events(order_id, kind, from_value, to_value, note, actor, customer_visible)
  values (p_order, p_kind, p_from, p_to, p_note, p_actor, p_visible);
$$;
revoke all on function public.vp_log(uuid,text,text,text,text,text,boolean) from public, anon, authenticated;

-- CUSTOMER functions -----------------------------------------------------
-- Place an order. Payment always starts as unpaid; only an admin can mark it paid.
create or replace function public.vp_place_order(p_customer jsonb, p_items jsonb, p_payment_method text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_order public.vp_orders;
  v_item jsonb;
  v_sub numeric(10,2) := 0;
  v_live boolean := false;
  v_qty int; v_price numeric;
begin
  if v_user is null then raise exception 'Please log in to place an order'; end if;
  if p_payment_method not in ('cod','pay_at_pickup','upi','online') then raise exception 'Invalid payment method'; end if;
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

  insert into public.vp_orders(user_id, customer_name, phone, email, address, city, pincode, fulfilment, payment_method, subtotal, total, customer_note)
  values (v_user, left(trim(p_customer->>'name'),120), p_customer->>'phone', left(p_customer->>'email',160), left(trim(p_customer->>'address'),400),
          left(p_customer->>'city',80), left(p_customer->>'pincode',10), case when v_live then 'live_arrangement' else 'shipping' end,
          p_payment_method, v_sub, v_sub, left(p_customer->>'note',500))
  returning * into v_order;

  insert into public.vp_order_items(order_id, product_slug, name, category, qty, unit_price, is_live, image)
  select v_order.id, left(i->>'slug',120), left(i->>'name',200), left(i->>'category',60), (i->>'qty')::int, (i->>'unit_price')::numeric,
         coalesce((i->>'is_live')::boolean,false), left(i->>'image',300)
  from jsonb_array_elements(p_items) i;

  perform public.vp_log(v_order.id, 'placed', null, 'pending_payment', 'Order received successfully', 'customer', true);
  return jsonb_build_object('id', v_order.id, 'order_no', v_order.order_no, 'fulfilment', v_order.fulfilment);
end $$;

create or replace function public.vp_request_cancellation(p_order uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.vp_orders; v_id uuid;
begin
  select * into o from public.vp_orders where id = p_order and user_id = auth.uid();
  if not found then raise exception 'Order not found'; end if;
  if o.order_status not in ('pending_payment','confirmed','processing') then raise exception 'This order can no longer be cancelled online. Please contact support.'; end if;
  if exists (select 1 from public.vp_order_requests where order_id = p_order and kind = 'cancellation' and status in ('open','in_review')) then raise exception 'A cancellation request is already open'; end if;
  insert into public.vp_order_requests(order_id, user_id, kind, message) values (p_order, auth.uid(), 'cancellation', coalesce(nullif(trim(p_reason),''),'Customer requested cancellation')) returning id into v_id;
  perform public.vp_log(p_order, 'request', null, 'cancellation', 'Cancellation requested', 'customer', true);
  return v_id;
end $$;

create or replace function public.vp_report_issue(p_order uuid, p_kind text, p_item uuid, p_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.vp_orders; v_id uuid;
begin
  if p_kind not in ('damaged','missing','incorrect') then raise exception 'Invalid issue type'; end if;
  select * into o from public.vp_orders where id = p_order and user_id = auth.uid();
  if not found then raise exception 'Order not found'; end if;
  if o.order_status not in ('shipped','out_for_delivery','delivered') then raise exception 'You can report a problem once the order has been dispatched.'; end if;
  if p_item is not null and not exists (select 1 from public.vp_order_items where id = p_item and order_id = p_order) then raise exception 'Item not in this order'; end if;
  insert into public.vp_order_requests(order_id, user_id, kind, item_id, message) values (p_order, auth.uid(), p_kind, p_item, p_message) returning id into v_id;
  perform public.vp_log(p_order, 'request', null, p_kind, 'Problem reported: ' || p_kind, 'customer', true);
  return v_id;
end $$;

create or replace function public.vp_contact_support(p_order uuid, p_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.vp_orders where id = p_order and user_id = auth.uid()) then raise exception 'Order not found'; end if;
  insert into public.vp_order_requests(order_id, user_id, kind, message) values (p_order, auth.uid(), 'support', p_message) returning id into v_id;
  perform public.vp_log(p_order, 'request', null, 'support', 'Message sent to support', 'customer', true);
  return v_id;
end $$;

-- ADMIN functions ----------------------------------------------------------
create or replace function public.vp_admin_set_status(p_order uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.vp_orders; ok boolean := false;
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  select * into o from public.vp_orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.order_status = p_status then return; end if;

  ok := case o.order_status
    when 'pending_payment' then p_status in ('confirmed','cancelled')
    when 'confirmed'       then p_status in ('processing','cancelled')
    when 'processing'      then p_status in ('shipped','out_for_delivery','delivered','cancelled')
    when 'shipped'         then p_status in ('out_for_delivery','delivered')
    when 'out_for_delivery' then p_status in ('delivered')
    when 'delivered'       then p_status in ('refund_pending')
    when 'cancelled'       then p_status in ('refund_pending')
    when 'refund_pending'  then p_status in ('refunded')
    else false end;
  if not ok then raise exception 'Cannot move an order from % to %', o.order_status, p_status; end if;

  if p_status = 'confirmed' then
    if o.payment_method in ('upi','online') and o.payment_status <> 'paid' then raise exception 'Payment has not been confirmed. Record the payment first.'; end if;
    if o.fulfilment = 'live_arrangement' and not o.availability_confirmed then raise exception 'Confirm availability of the live item first.'; end if;
  end if;
  if p_status = 'shipped' then
    if o.fulfilment = 'live_arrangement' then raise exception 'Live pets and fish use "Out for delivery" with an arrangement, not parcel shipping.'; end if;
    if coalesce(o.tracking_number,'') = '' then raise exception 'Add tracking details before marking as shipped.'; end if;
  end if;
  if p_status = 'refund_pending' and o.payment_status not in ('paid','refund_pending') then raise exception 'Nothing to refund: payment was never confirmed.'; end if;

  update public.vp_orders set
    order_status = p_status,
    dispatched_at = case when p_status in ('shipped','out_for_delivery') and dispatched_at is null then now() else dispatched_at end,
    delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
    payment_status = case when p_status = 'refund_pending' then 'refund_pending' when p_status = 'refunded' then 'refunded' else payment_status end,
    updated_at = now()
  where id = p_order;
  perform public.vp_log(p_order, 'status', o.order_status, p_status, p_note, 'admin', true);
end $$;

create or replace function public.vp_admin_set_payment(p_order uuid, p_status text, p_reference text default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.vp_orders;
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  if p_status not in ('unpaid','pending','paid','failed','refund_pending','refunded') then raise exception 'Invalid payment status'; end if;
  select * into o from public.vp_orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if p_status = 'paid' and coalesce(trim(p_reference),'') = '' then raise exception 'Enter the payment reference (UPI/transaction ID or receipt no.) before marking as paid.'; end if;
  update public.vp_orders set payment_status = p_status,
    payment_reference = coalesce(nullif(trim(p_reference),''), payment_reference),
    paid_at = case when p_status = 'paid' then now() else paid_at end,
    updated_at = now() where id = p_order;
  perform public.vp_log(p_order, 'payment', o.payment_status, p_status, coalesce(p_note, p_reference), 'admin', true);
end $$;

create or replace function public.vp_admin_set_tracking(p_order uuid, p_carrier text, p_number text, p_url text default null, p_eta date default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  if coalesce(trim(p_number),'') = '' then raise exception 'Tracking number is required'; end if;
  if p_url is not null and p_url <> '' and p_url !~* '^https?://' then raise exception 'Tracking link must start with http:// or https://'; end if;
  update public.vp_orders set carrier = nullif(trim(p_carrier),''), tracking_number = trim(p_number), tracking_url = nullif(trim(p_url),''),
    estimated_delivery = p_eta, updated_at = now() where id = p_order;
  perform public.vp_log(p_order, 'tracking', null, trim(p_number), coalesce(nullif(trim(p_carrier),''),'Carrier') || ' tracking added', 'admin', true);
end $$;

create or replace function public.vp_admin_set_arrangement(p_order uuid, p_available boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  update public.vp_orders set availability_confirmed = p_available, arrangement_note = nullif(trim(p_note),''), updated_at = now() where id = p_order;
  perform public.vp_log(p_order, 'arrangement', null, case when p_available then 'available' else 'not_confirmed' end, nullif(trim(p_note),''), 'admin', true);
end $$;

create or replace function public.vp_admin_add_note(p_order uuid, p_note text, p_visible boolean default false)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  perform public.vp_log(p_order, 'note', null, null, p_note, 'admin', p_visible);
end $$;

create or replace function public.vp_admin_resolve_request(p_request uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.vp_order_requests;
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  if p_status not in ('open','in_review','resolved','rejected') then raise exception 'Invalid status'; end if;
  update public.vp_order_requests set status = p_status, admin_note = nullif(trim(p_note),''),
    resolved_at = case when p_status in ('resolved','rejected') then now() else null end
  where id = p_request returning * into r;
  if not found then raise exception 'Request not found'; end if;
  perform public.vp_log(r.order_id, 'request', r.kind, p_status, coalesce(p_note,'Request updated'), 'admin', true);
end $$;

create or replace function public.vp_admin_set_service(p_id uuid, p_status text, p_scheduled timestamptz default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.vp_is_admin() then raise exception 'Admins only'; end if;
  if p_status not in ('requested','confirmed','scheduled','completed','cancelled') then raise exception 'Invalid status'; end if;
  if p_status = 'scheduled' and p_scheduled is null then raise exception 'Choose the appointment date and time'; end if;
  update public.vp_service_requests set status = p_status, scheduled_for = coalesce(p_scheduled, scheduled_for),
    admin_note = coalesce(nullif(trim(p_note),''), admin_note), updated_at = now() where id = p_id;
end $$;

-- permissions: logged-in users can call the functions; anonymous visitors cannot
do $$ declare f text; begin
  foreach f in array array[
    'vp_place_order(jsonb,jsonb,text)','vp_request_cancellation(uuid,text)','vp_report_issue(uuid,text,uuid,text)','vp_contact_support(uuid,text)',
    'vp_admin_set_status(uuid,text,text)','vp_admin_set_payment(uuid,text,text,text)','vp_admin_set_tracking(uuid,text,text,text,date)',
    'vp_admin_set_arrangement(uuid,boolean,text)','vp_admin_add_note(uuid,text,boolean)','vp_admin_resolve_request(uuid,text,text)','vp_admin_set_service(uuid,text,timestamptz,text)']
  loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- To make yourself an admin (run once, with your own login email):
-- insert into public.user_roles(user_id, role) select id, 'admin' from auth.users where email = 'you@example.com' on conflict do nothing;
