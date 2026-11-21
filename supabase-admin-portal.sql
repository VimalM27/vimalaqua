-- =====================================================================
-- VIMAL27 SINGLE-OWNER ADMIN PORTAL  — run ONCE in Supabase > SQL Editor
-- Safe to re-run. Adds NEW tables only (prefix vp_admin_ / vp_page_content).
-- Every new table has RLS enabled with NO policies and all grants revoked from
-- anon/authenticated, so the browser (publishable key) can never read or write them.
-- Only the server (service-role key, kept in Vercel env vars) can.
-- =====================================================================
create extension if not exists pgcrypto;

-- 1. THE ONE OWNER ------------------------------------------------------
-- id is forced to 1 by a CHECK + primary key => a second administrator row is impossible.
create table if not exists public.vp_admin_account (
  id smallint primary key default 1 check (id = 1),
  username text not null check (char_length(username) between 3 and 40),
  email text not null,
  password_hash text not null,             -- Argon2id PHC string. Never plaintext.
  password_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists vp_admin_account_email_uq on public.vp_admin_account (lower(email));
create unique index if not exists vp_admin_account_user_uq on public.vp_admin_account (lower(username));

-- Block deletes/truncates through any path except a deliberate SQL-editor action:
create or replace function public.vp_admin_account_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then raise exception 'The owner account cannot be deleted from the app.'; end if;
  if tg_op = 'INSERT' and (select count(*) from public.vp_admin_account) >= 1 then raise exception 'An owner account already exists.'; end if;
  return new;
end $$;
drop trigger if exists vp_admin_account_guard_t on public.vp_admin_account;
create trigger vp_admin_account_guard_t before insert or delete on public.vp_admin_account
  for each row execute function public.vp_admin_account_guard();

-- 2. SESSIONS (only a SHA-256 hash of the cookie token is stored) --------
create table if not exists public.vp_admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  ip text, user_agent text
);
create index if not exists vp_admin_sessions_active_idx on public.vp_admin_sessions (expires_at) where revoked_at is null;

-- 3. LOGIN ATTEMPTS (rate limiting / brute-force protection) -------------
create table if not exists public.vp_admin_login_attempts (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  ip text not null,
  identifier_hash text not null,           -- HMAC of the username typed, never the raw value
  success boolean not null,
  user_agent text
);
create index if not exists vp_admin_attempts_ip_idx on public.vp_admin_login_attempts (ip, at desc);
create index if not exists vp_admin_attempts_id_idx on public.vp_admin_login_attempts (identifier_hash, at desc);

-- 4. AUDIT LOG (append-only from the app's point of view) -----------------
create table if not exists public.vp_admin_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  action text not null,
  ip text, user_agent text,
  detail jsonb not null default '{}'::jsonb
);
create index if not exists vp_admin_audit_at_idx on public.vp_admin_audit_log (at desc);

-- 5. PAGE CMS (Toys page) -------------------------------------------------
create table if not exists public.vp_page_content (
  page_key text primary key,
  draft jsonb not null default '{}'::jsonb,
  published jsonb,
  version int not null default 0,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- 6. LOCK DOWN: RLS on, no policies, no grants for browser roles ----------
do $$ declare t text; begin
  foreach t in array array['vp_admin_account','vp_admin_sessions','vp_admin_login_attempts','vp_admin_audit_log','vp_page_content'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- 7. Let the SERVER (service-role key) call your EXISTING admin functions.
-- Your existing vp_admin_set_status / vp_admin_set_payment / ... check vp_is_admin(),
-- which only recognised a logged-in Supabase user listed in user_roles. We keep that
-- behaviour and ALSO accept the service role (key lives only on the server).
create or replace function public.vp_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth.role(), '') = 'service_role'
      or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- 8. OPTIONAL (recommended once you've confirmed /admin works):
-- Make the portal the ONLY admin by removing old Supabase-account admins:
--   delete from public.user_roles where role = 'admin';
-- (Then vp_is_admin() is true only for the server. The old admin-*.html pages stop working, which is intended.)

-- 9. Public bucket for images uploaded from the Toys Page editor (server uploads with service key; anyone can VIEW).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media','site-media', true, 3145728, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
