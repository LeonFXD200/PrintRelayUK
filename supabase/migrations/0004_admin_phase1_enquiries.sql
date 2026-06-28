-- ===========================================================================
-- 0004_admin_phase1_enquiries.sql  (Admin system — Phase 1)
-- ---------------------------------------------------------------------------
-- Evolves public.quote_enquiries (from 0001) so the persisted data can drive
-- the admin system: an admin-set quote price, the fulfilment lifecycle, and a
-- PR-#### customer reference.
--
-- ADDITIVE + idempotent. No renames, no drops of data: the live submit-enquiry
-- Edge Function, the notification/acknowledgement emails, the private file flow
-- and the current admin demo all keep working unchanged. Safe to re-run.
-- Run it in the Supabase SQL Editor (or via the CLI) on the linked project,
-- after 0001, 0002 and 0003.
-- ===========================================================================

-- 1) Admin-entered quote price (GBP). NULL until an admin sets it. The public
--    submit path never writes this column.
alter table public.quote_enquiries
  add column if not exists quote_price numeric(10,2);

-- 2) Widen the status lifecycle to the admin set — New, Quoted, Awaiting
--    approval, Printing, Posted, Complete — stored as slugs, while KEEPING the
--    original values so existing rows and the current demo never break. The
--    default stays 'new' (= "New"). The inline CHECK from 0001 is named
--    quote_enquiries_status_check; we replace it by the same name (idempotent).
alter table public.quote_enquiries
  drop constraint if exists quote_enquiries_status_check;
alter table public.quote_enquiries
  add constraint quote_enquiries_status_check
  check (status in (
    -- original lifecycle (kept for backward compatibility / existing rows)
    'new','contacted','quoted','accepted','declined',
    -- new admin fulfilment lifecycle (slugs map to the labels below)
    'awaiting_approval','printing','posted','complete'
  ));
-- slug -> label:  new=New  quoted=Quoted  awaiting_approval=Awaiting approval
--                 printing=Printing  posted=Posted  complete=Complete

-- 3) New customer references use PR-#### (was ENQ-####). Existing references are
--    left as-is; the enquiry_ref_seq from 0001 simply continues, so new rows get
--    PR-<n>. (Prefixes differ, so there is no collision with old ENQ- values.)
alter table public.quote_enquiries
  alter column reference
  set default ('PR-' || nextval('public.enquiry_ref_seq')::text);

-- Optional: to start the numbering at a chosen value (e.g. PR-1024), run ONCE.
-- Left commented out so re-running this migration never moves the sequence:
--   select setval('public.enquiry_ref_seq', 1024, false);
