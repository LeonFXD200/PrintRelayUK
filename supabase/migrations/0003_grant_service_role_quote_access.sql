-- ===========================================================================
-- 0003_grant_service_role_quote_access.sql
-- ---------------------------------------------------------------------------
-- HISTORICAL RECORD of a grant already applied manually in Supabase during
-- go-live, to fix "permission denied for table quote_enquiries" when the
-- submit-enquiry Edge Function inserts as the service_role. Recorded here so the
-- local migration history matches the live database. Idempotent (re-running
-- GRANTs is a no-op). Applied before 0004_admin_phase1_enquiries.sql.
-- ===========================================================================

grant usage on schema public to service_role;

grant select, insert
on table public.quote_enquiries
to service_role;

grant usage, select
on sequence public.enquiry_ref_seq
to service_role;
