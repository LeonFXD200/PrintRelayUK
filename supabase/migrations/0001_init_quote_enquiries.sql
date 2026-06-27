-- ===========================================================================
-- 0001_init_quote_enquiries.sql
-- ---------------------------------------------------------------------------
-- Hardened schema for the /quote form. Run this in the Supabase SQL editor (or
-- via the Supabase CLI) once you've created your project. Safe to re-run.
--
-- SECURITY MODEL (defence in depth):
--   * Public submissions go ONLY through the `submit-enquiry` Edge Function,
--     which uses the service-role key (never the browser). There is NO insert
--     policy here, so the anon/authenticated roles cannot insert directly.
--   * Reading/updating enquiries is restricted to admins (see app_admins +
--     is_admin()). Anonymous visitors can select/list/update NOTHING.
--   * The service-role key bypasses RLS and is used only inside Edge Functions.
-- ===========================================================================

-- Human-friendly reference (e.g. ENQ-1042) alongside the uuid primary key.
create sequence if not exists public.enquiry_ref_seq start 1042;

create table if not exists public.quote_enquiries (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null default ('ENQ-' || nextval('public.enquiry_ref_seq')::text),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- contact
  name          text not null,
  email         text not null,
  phone         text not null,
  business_name text default '',

  -- project
  what_printed  text not null,
  quantity      integer not null default 1,
  material      text,
  colour        text,
  dimensions    text default '',

  -- file (stored in the private `enquiry-files` bucket; file_url = object path)
  file_name     text default '',
  file_size     bigint default 0,
  file_url      text,

  -- logistics
  deadline      date,
  budget        text default '',
  notes         text default '',

  -- meta
  consent       boolean not null default false,
  source        text default 'quote-form',
  status        text not null default 'new'
                  check (status in ('new','contacted','quoted','accepted','declined')),
  admin_notes   text default ''
);

create index if not exists quote_enquiries_status_idx     on public.quote_enquiries (status);
create index if not exists quote_enquiries_created_at_idx  on public.quote_enquiries (created_at desc);

-- keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quote_enquiries_set_updated_at on public.quote_enquiries;
create trigger quote_enquiries_set_updated_at
  before update on public.quote_enquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin allow-list + helper. Add YOUR Supabase Auth account's email here AFTER
-- you create it (Authentication → Users → Add user), e.g.:
--   insert into public.app_admins (email) values ('you@yourdomain.co.uk');
-- Only emails in this table can read/update enquiries or download files.
-- ---------------------------------------------------------------------------
create table if not exists public.app_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Locked down: no anon/authenticated policies, so only the service role can
-- read/modify the allow-list. is_admin() reads it via SECURITY DEFINER.
alter table public.app_admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security on enquiries
-- ---------------------------------------------------------------------------
alter table public.quote_enquiries enable row level security;

-- NO insert policy: the public form cannot write directly. Inserts happen only
-- inside the `submit-enquiry` Edge Function using the service-role key.

-- NO delete policy: nobody (except the service role) can delete.

-- Admin-only read.
drop policy if exists "Admins can read enquiries" on public.quote_enquiries;
create policy "Admins can read enquiries"
  on public.quote_enquiries for select
  to authenticated
  using ( public.is_admin() );

-- Admin-only update (status + notes).
drop policy if exists "Admins can update enquiries" on public.quote_enquiries;
create policy "Admins can update enquiries"
  on public.quote_enquiries for update
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );
