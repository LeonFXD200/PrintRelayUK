-- ===========================================================================
-- 0002_storage_enquiry_files.sql
-- ---------------------------------------------------------------------------
-- Private storage bucket for quote-enquiry uploads (STL / 3MF / OBJ / STEP / ZIP).
--
-- SECURITY MODEL:
--   * Bucket is PRIVATE (public = false) — files are never publicly accessible.
--   * Uploads happen ONLY via short-lived signed upload URLs minted by the
--     `submit-enquiry` Edge Function (service role) after validation + Turnstile.
--     Signed-URL uploads bypass RLS, so there is NO insert policy for the
--     anon/authenticated roles — the public cannot upload arbitrarily.
--   * Downloads are admin-only: the select policy below lets a signed-in admin
--     mint a short-lived signed download URL. Anonymous visitors get nothing.
--   * Depends on public.is_admin() from 0001 — run that migration first.
-- ===========================================================================

-- Create the private bucket. 52428800 = 50 MB, matching MAX_FILE_MB in the
-- app's validateQuote.js — keep them in sync if you change it.
insert into storage.buckets (id, name, public, file_size_limit)
values ('enquiry-files', 'enquiry-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

-- Admin-only READ (used to mint short-lived signed download URLs in /admin).
-- No anon access; no public listing. Tighten further if you wish.
drop policy if exists "Admins can read enquiry files" on storage.objects;
create policy "Admins can read enquiry files"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'enquiry-files' and public.is_admin() );

-- NOTE: there is deliberately NO insert/update/delete policy for the
-- anon/authenticated roles. Uploads use signed upload URLs (service role);
-- the public can never write to or read from this bucket directly.
