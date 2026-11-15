-- =====================================================================
-- VIMAL CAREERS  (run ONCE in Supabase > SQL Editor; safe to re-run)
-- Needs supabase-orders.sql already run (vp_is_admin()).
-- =====================================================================

-- 1. Job roles ---------------------------------------------------------
create table if not exists public.career_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  department text,
  location text not null default 'Coimbatore',
  job_type text not null default 'Full-time' check (job_type in ('Full-time','Part-time','Internship','Contract')),
  experience text,                 -- e.g. "0-2 years"
  salary_range text,               -- optional, e.g. "₹15,000 - ₹22,000 / month"
  description text not null,
  requirements text,
  status text not null default 'open' check (status in ('open','closed','draft')),
  closes_on date,
  created_at timestamptz not null default now()
);
alter table public.career_jobs enable row level security;
drop policy if exists "jobs public read open" on public.career_jobs;
drop policy if exists "jobs admin all" on public.career_jobs;
create policy "jobs public read open" on public.career_jobs for select
  using (status = 'open' and (closes_on is null or closes_on >= current_date));
create policy "jobs admin all" on public.career_jobs for all to authenticated
  using (public.vp_is_admin()) with check (public.vp_is_admin());

-- 2. Applications (nobody can read/write these directly except admins) -------
create table if not exists public.career_applications (
  id uuid primary key,
  job_id uuid references public.career_jobs(id) on delete set null,   -- null = general application
  job_title text,                                                      -- kept even if the job is deleted
  applicant_name text not null,
  email text not null,
  phone text not null,
  city text,
  experience_years numeric(4,1),
  cover_note text,
  resume_path text not null,
  resume_name text,
  status text not null default 'applied'
    check (status in ('applied','under_review','shortlisted','interview_scheduled','interviewed','offered','hired','rejected')),
  interview_at timestamptz,
  interview_mode text check (interview_mode in ('in_person','phone','video')),
  interview_place text,            -- address or meeting link
  public_note text,                -- the applicant CAN see this
  admin_note text,                 -- internal only
  tracking_code text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists career_apps_job_idx on public.career_applications(job_id, created_at desc);
alter table public.career_applications enable row level security;
drop policy if exists "apps admin all" on public.career_applications;
create policy "apps admin all" on public.career_applications for all to authenticated
  using (public.vp_is_admin()) with check (public.vp_is_admin());

-- 3. Resume storage (private) -----------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('career-resumes','career-resumes', false, 5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

drop policy if exists "resume anyone upload" on storage.objects;
drop policy if exists "resume admin read"   on storage.objects;
drop policy if exists "resume admin delete" on storage.objects;
-- visitors may ADD a file under a fresh <uuid>/ folder, but can never read, replace or delete any file
create policy "resume anyone upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'career-resumes' and name ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,100}$');
create policy "resume admin read" on storage.objects for select to authenticated
  using (bucket_id = 'career-resumes' and public.vp_is_admin());
create policy "resume admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'career-resumes' and public.vp_is_admin());

-- 4. Apply (public) ---------------------------------------------------------
create or replace function public.career_apply(
  p_id uuid, p_job uuid, p_name text, p_email text, p_phone text, p_city text,
  p_experience numeric, p_note text, p_resume_path text, p_resume_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_title text; v_code text; v_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if char_length(trim(coalesce(p_name,''))) not between 2 and 120 then raise exception 'Please enter your full name.'; end if;
  if coalesce(p_email,'') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 160 then raise exception 'Please enter a valid email address.'; end if;
  if v_phone !~ '^[0-9]{10}$' then raise exception 'Enter a valid 10-digit mobile number.'; end if;
  if p_experience is not null and (p_experience < 0 or p_experience > 60) then raise exception 'Enter valid years of experience.'; end if;
  if p_resume_path is null or p_resume_path <> p_id::text || '/' || split_part(p_resume_path, '/', 2) or split_part(p_resume_path,'/',3) <> '' then
    raise exception 'Please attach your resume.'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'career-resumes' and name = p_resume_path) then
    raise exception 'Your resume did not upload. Please try again.'; end if;

  if p_job is null then v_title := 'General application';
  else
    select title into v_title from public.career_jobs
      where id = p_job and status = 'open' and (closes_on is null or closes_on >= current_date);
    if v_title is null then raise exception 'This position is no longer open.'; end if;
  end if;

  if exists (select 1 from public.career_applications where right(regexp_replace(phone,'\D','','g'),10) = v_phone
             and job_id is not distinct from p_job and status not in ('rejected')) then
    raise exception 'You have already applied for this role. Use "Track my application" to see its status.'; end if;
  if (select count(*) from public.career_applications where right(regexp_replace(phone,'\D','','g'),10) = v_phone
        and created_at > now() - interval '1 day') >= 3 then
    raise exception 'Too many applications today. Please try again tomorrow.'; end if;

  v_code := 'CR' || upper(substr(md5(random()::text || clock_timestamp()::text || p_id::text), 1, 8));
  insert into public.career_applications(id, job_id, job_title, applicant_name, email, phone, city, experience_years,
      cover_note, resume_path, resume_name, tracking_code)
  values (p_id, p_job, v_title, trim(p_name), lower(trim(p_email)), v_phone, left(trim(coalesce(p_city,'')),80), p_experience,
      left(coalesce(p_note,''), 1500), p_resume_path, left(coalesce(p_resume_name,''), 120), v_code);
  return jsonb_build_object('tracking_code', v_code, 'job_title', v_title);
end $$;
revoke all on function public.career_apply(uuid,uuid,text,text,text,text,numeric,text,text,text) from public;
grant execute on function public.career_apply(uuid,uuid,text,text,text,text,numeric,text,text,text) to anon, authenticated;

-- 5. Track (public: needs BOTH the tracking code and the phone number) ---------
create or replace function public.career_track(p_code text, p_phone text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare a public.career_applications;
begin
  select * into a from public.career_applications
   where tracking_code = upper(trim(coalesce(p_code,'')))
     and right(regexp_replace(phone,'\D','','g'),10) = right(regexp_replace(coalesce(p_phone,''),'\D','','g'),10);
  if not found then return null; end if;
  return jsonb_build_object('applicant_name', a.applicant_name, 'job_title', a.job_title, 'status', a.status,
    'applied_at', a.created_at, 'updated_at', a.updated_at, 'public_note', a.public_note,
    'interview_at', a.interview_at, 'interview_mode', a.interview_mode, 'interview_place', a.interview_place);
end $$;
revoke all on function public.career_track(text,text) from public;
grant execute on function public.career_track(text,text) to anon, authenticated;

-- 6. keep updated_at fresh ---------------------------------------------------
create or replace function public.career_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists career_touch on public.career_applications;
create trigger career_touch before update on public.career_applications for each row execute function public.career_touch();

-- 7. Example roles (delete these in the admin page if you don't want them)
insert into public.career_jobs(title, department, location, job_type, experience, description, requirements)
select 'Store Sales Executive', 'Retail', 'Coimbatore', 'Full-time', '0-2 years',
  'Help customers choose pets, food and accessories, manage billing and keep the shop floor tidy.',
  E'Good communication in Tamil and English\nLove for animals\nBasic billing / computer skills'
where not exists (select 1 from public.career_jobs);
