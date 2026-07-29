-- ===================================================
-- Vimal Farms Marketplace - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ===================================================

-- 0. Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1. Shop owner profiles (linked to Supabase Auth users)
create table if not exists profiles (
    id uuid references auth.users on delete cascade primary key,
    shop_name text not null,
    owner_name text not null,
    phone text,
    shop_address text,
    subscription_status text default 'inactive', -- inactive | active | expired
    plan_name text,
    plan_expiry date,
    created_at timestamp default now()
);

alter table profiles enable row level security;

-- shop owners can read/update only their own profile
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on profiles for insert
    with check (auth.uid() = id);

-- allow public read of shop_name for active shops (used by marketplace page)
create policy "Public can view active shop names"
    on profiles for select
    using (subscription_status = 'active');


-- 2. Products
create table if not exists products (
    id uuid default gen_random_uuid() primary key,
    shop_owner_id uuid references profiles(id) on delete cascade,
    product_name text not null,
    category text,
    price numeric(10,2) not null,
    stock int default 0,
    image_url text,
    description text,
    created_at timestamp default now()
);

alter table products enable row level security;

-- anyone (even logged out visitors) can view products - needed for public marketplace page
create policy "Public can view products"
    on products for select
    using (true);

-- only the owning shop owner can insert/update/delete their own products
create policy "Owners can insert own products"
    on products for insert
    with check (auth.uid() = shop_owner_id);

create policy "Owners can update own products"
    on products for update
    using (auth.uid() = shop_owner_id);

create policy "Owners can delete own products"
    on products for delete
    using (auth.uid() = shop_owner_id);


-- 3. Subscription plans (fixed list, publicly readable)
create table if not exists subscription_plans (
    id serial primary key,
    plan_name text not null,
    price numeric(10,2) not null,
    duration_days int not null,
    description text
);

alter table subscription_plans enable row level security;

create policy "Public can view plans"
    on subscription_plans for select
    using (true);

-- unique constraint needed so the "on conflict" clause below works
alter table subscription_plans
    add constraint subscription_plans_plan_name_key unique (plan_name);

insert into subscription_plans (plan_name, price, duration_days, description) values
('Basic', 299.00, 30, 'List up to 20 products, 1 month access'),
('Premium', 799.00, 90, 'Unlimited products, 3 months access, featured listing'),
('Yearly', 2499.00, 365, 'Unlimited products, 12 months access, priority support')
on conflict (plan_name) do nothing;


-- 4. Payments log
create table if not exists payments (
    id uuid default gen_random_uuid() primary key,
    shop_owner_id uuid references profiles(id) on delete cascade,
    plan_id int references subscription_plans(id),
    amount numeric(10,2) not null,
    payment_status text default 'pending',
    transaction_id text,
    paid_at timestamp default now()
);

alter table payments enable row level security;

create policy "Users can view own payments"
    on payments for select
    using (auth.uid() = shop_owner_id);

create policy "Users can insert own payments"
    on payments for insert
    with check (auth.uid() = shop_owner_id);


-- 5. Storage bucket for product images (run separately if it fails here)
-- Go to Supabase Dashboard > Storage > Create a new bucket named "product-images" (set to Public)
