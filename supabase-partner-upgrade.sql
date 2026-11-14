-- =====================================================================
-- VIMAL PARTNER UPGRADE  (run ONCE in Supabase > SQL Editor)
-- Prerequisite: supabase-orders.sql already run (it creates vp_is_admin()).
-- Safe to re-run: everything uses IF NOT EXISTS / DROP IF EXISTS.
-- =====================================================================

-- 1. New columns -------------------------------------------------------
alter table public.profiles
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists shop_website text,
  add column if not exists shop_description text,
  add column if not exists whatsapp text;

alter table public.products
  add column if not exists product_url text,                 -- link to the product on the partner's own website
  add column if not exists source text default 'manual',     -- manual | website | csv
  add column if not exists brand text,
  add column if not exists is_active boolean default true;

alter table public.products drop constraint if exists products_source_chk;
alter table public.products add constraint products_source_chk
  check (source in ('manual','website','csv'));
alter table public.products drop constraint if exists products_url_chk;
alter table public.products add constraint products_url_chk
  check (product_url is null or product_url ~* '^https://');
alter table public.profiles drop constraint if exists profiles_website_chk;
alter table public.profiles add constraint profiles_website_chk
  check (shop_website is null or shop_website ~* '^https://');

-- 2. Documents table: one row per document type, NEVER editable by partner
create table if not exists public.seller_documents (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('id_proof','gst_certificate','shop_license','bank_proof')),
  file_path text not null,
  file_name text,
  review_status text not null default 'submitted',   -- submitted | approved | rejected
  admin_note text,
  uploaded_at timestamptz not null default now(),
  unique (seller_id, doc_type)                        -- one file per type, ever
);
alter table public.seller_documents enable row level security;

drop policy if exists "docs owner read"   on public.seller_documents;
drop policy if exists "docs owner insert" on public.seller_documents;
drop policy if exists "docs admin all"    on public.seller_documents;
-- partner sees ONLY their own rows
create policy "docs owner read"   on public.seller_documents for select to authenticated
  using (seller_id = auth.uid());
-- partner may add a document once; there is deliberately NO update / delete policy
create policy "docs owner insert" on public.seller_documents for insert to authenticated
  with check (seller_id = auth.uid() and review_status = 'submitted' and admin_note is null);
-- admins can review, unlock (delete) and read everything
create policy "docs admin all"    on public.seller_documents for all to authenticated
  using (public.vp_is_admin()) with check (public.vp_is_admin());

-- 3. Private storage bucket + folder-scoped policies -------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seller-kyc-docs','seller-kyc-docs', false, 5242880,
        array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
        allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

drop policy if exists "kyc owner read"   on storage.objects;
drop policy if exists "kyc owner insert" on storage.objects;
drop policy if exists "kyc admin delete" on storage.objects;
create policy "kyc owner read" on storage.objects for select to authenticated
  using (bucket_id = 'seller-kyc-docs'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.vp_is_admin()));
create policy "kyc owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'seller-kyc-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kyc admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'seller-kyc-docs' and public.vp_is_admin());
-- NOTE: no update / delete for partners => a file can't be replaced once uploaded.
-- Then open Storage > Policies and DELETE any older, broader policy on this bucket.

-- 4. Lock submitted profile details ------------------------------------
-- A partner can still fill a field that is empty, but can never change one that already has a value.
create or replace function public.vp_lock_profile_fields() returns trigger
language plpgsql as $$
declare k text;
  locked text[] := array['business_type','shop_name','owner_name','email','phone','shop_address','city','state',
    'pincode','pan_number','aadhaar_number','gstin','account_holder','account_number','ifsc','bank_name',
    'verification_status','subscription_status','plan_name','plan_expiry'];
begin
  if auth.uid() is null or public.vp_is_admin() then return new; end if;   -- SQL editor / service role / admin
  foreach k in array locked loop
    if coalesce(to_jsonb(old)->>k,'') <> '' and (to_jsonb(new)->k) is distinct from (to_jsonb(old)->k) then
      raise exception 'The field "%" was submitted for verification and cannot be changed. Contact support.', k;
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists vp_lock_profile_fields on public.profiles;
create trigger vp_lock_profile_fields before update on public.profiles
  for each row execute function public.vp_lock_profile_fields();
-- This also closes a hole: before, a partner could set their own subscription_status to 'active'.

-- 5. Products: only active partners can add, plan limits, public visibility
create or replace function public.vp_shop_is_live(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p
                 where p.id = sid and p.subscription_status = 'active' and p.plan_expiry >= current_date);
$$;

drop policy if exists "Owners can insert own products" on public.products;
create policy "Owners can insert own products" on public.products for insert to authenticated
  with check (auth.uid() = shop_owner_id and public.vp_shop_is_live(auth.uid()));

drop policy if exists "Public can view products" on public.products;
drop policy if exists "Public can view live products" on public.products;
create policy "Public can view live products" on public.products for select
  using ((coalesce(is_active,true) and public.vp_shop_is_live(shop_owner_id))
         or auth.uid() = shop_owner_id or public.vp_is_admin());

create or replace function public.vp_enforce_product_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare plan text; n int;
begin
  select plan_name into plan from public.profiles where id = new.shop_owner_id;
  if plan = 'Basic' then
    select count(*) into n from public.products where shop_owner_id = new.shop_owner_id;
    if n >= 20 then raise exception 'Basic plan allows up to 20 products. Upgrade your plan to add more.'; end if;
  end if;
  return new;
end $$;
drop trigger if exists vp_enforce_product_limit on public.products;
create trigger vp_enforce_product_limit before insert on public.products
  for each row execute function public.vp_enforce_product_limit();

-- 6. Public shop view: marketplace never touches the profiles table again
--    (the old "Public can view active shop names" policy exposed EVERY column, incl. PAN/bank, to anyone)
drop policy if exists "Public can view active shop names" on public.profiles;
create or replace view public.public_shops as
  select id, shop_name, shop_address, city, state, phone, whatsapp, shop_website, shop_description
  from public.profiles
  where subscription_status = 'active' and plan_expiry >= current_date;
grant select on public.public_shops to anon, authenticated;

-- 7. Partners can't unhide a product an admin hid (is_active is admin-controlled)
create or replace function public.vp_lock_product_visibility() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and not public.vp_is_admin() and new.is_active is distinct from old.is_active then
    new.is_active := old.is_active;
  end if;
  return new;
end $$;
drop trigger if exists vp_lock_product_visibility on public.products;
create trigger vp_lock_product_visibility before update on public.products
  for each row execute function public.vp_lock_product_visibility();

-- 8. Admin can read every partner profile (needed by admin-partner-details.html)
drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles for select to authenticated
  using (public.vp_is_admin());

-- 9. Keep each partner's email on their profile so admins can see it (auth.users isn't readable from the browser)
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;
create or replace function public.vp_set_profile_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is null then select email into new.email from auth.users where id = new.id; end if;
  return new;
end $$;
drop trigger if exists vp_set_profile_email on public.profiles;
create trigger vp_set_profile_email before insert on public.profiles
  for each row execute function public.vp_set_profile_email();
