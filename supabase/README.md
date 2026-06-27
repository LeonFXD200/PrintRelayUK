# Supabase backend (secure quote enquiries)

Everything needed to back the `/quote` form with a real database, private file
storage, email and bot protection — **hardened for production**. None of it is
active until you add keys; until then the app runs in demo mode (enquiries saved
to `localStorage`).

```
supabase/
├── migrations/
│   ├── 0001_init_quote_enquiries.sql   table, app_admins allow-list, is_admin(), RLS (admin-only read/update, NO public insert)
│   └── 0002_storage_enquiry_files.sql  PRIVATE bucket + admin-only read policy (NO public upload/download)
├── functions/
│   └── submit-enquiry/                 the ONLY public write path
│       ├── index.ts                    validate → verify Turnstile → signed upload URL → insert → email
│       └── templates.ts                admin + customer HTML emails
└── config.toml
```

## Security model (how the requirements are met)

| Requirement | How |
| --- | --- |
| No demo auth in production | `/admin` uses real Supabase Auth in live mode; admin status comes from `is_admin()` (DB), not the browser |
| Only my admin can use `/admin` | `app_admins` allow-list + RLS; non-admins can read/update nothing |
| Disable public sign-up | App blocks `register()` in live mode; you also turn off sign-ups in the Supabase dashboard |
| Anon can't select/list/update/delete enquiries | RLS: only `is_admin()` may select/update; **no** insert/delete policy at all |
| Anon can't download files / bucket not public | Bucket is `public=false`; only admins can mint signed download URLs |
| Public submit goes through an Edge Function | Browser calls `submit-enquiry`; it owns all DB/storage writes via the service-role key |
| Function validates + Turnstile + upload + insert + email | All server-side in `submit-enquiry/index.ts`; Turnstile is verified **before** any write and **fails closed** in production (`REQUIRE_TURNSTILE`, default `true`) |
| CORS restricted to known origins | The function reflects only `printrelay.co.uk`, `www.printrelay.co.uk` and localhost dev — never `*`. This **complements** Turnstile but is **not** the main anti-spam defence (non-browser clients ignore CORS) |
| Admin downloads = short-lived signed URLs after admin check | RLS gates storage `select` to admins; the app calls `createSignedUrl` (10-min expiry) |
| No service-role / Resend / Turnstile secret in frontend | Service role is auto-injected into the function; the rest are function secrets |

## Setup steps

### 1. Create the project & schema
1. Create a project at [supabase.com](https://supabase.com) — pick an **EU/UK region**.
2. In **SQL Editor**, run the migrations **in order**: `0001_…` then `0002_…`.

### 2. Create your admin account (no public sign-up)
1. **Authentication → Users → Add user** — create your own email + password.
2. **Authentication → Sign In / Providers → Email**: turn **OFF** “Allow new users to sign up” (so only you exist).
3. Add yourself to the allow-list in **SQL Editor**:
   ```sql
   insert into public.app_admins (email) values ('you@yourdomain.co.uk');
   ```

### 3. Deploy the submission function
```bash
supabase functions deploy submit-enquiry
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you do **not** set them.

### 4. Point the app at Supabase
Copy `.env.example` → `.env` (project root) and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`. The demo banner disappears; submissions now flow through the function.

### 5. (Optional) Email via Resend
```bash
supabase secrets set RESEND_API_KEY=re_xxx \
  ENQUIRY_FROM_EMAIL="PrintRelay UK <quotes@yourdomain.co.uk>" \
  ENQUIRY_NOTIFY_EMAIL=you@yourdomain.co.uk
```
With no `RESEND_API_KEY`, the function still stores enquiries and simply sends nothing.

### 6. Bot protection via Turnstile — REQUIRED for production (fails closed)

The function **fails closed**: with the default `REQUIRE_TURNSTILE=true` it
rejects every submission unless a valid Turnstile token is present, and it
rejects outright (HTTP 503) if Turnstile isn't configured at all. **Do not
enable live mode until Turnstile is set up** — otherwise the form will reject
everything by design. (Only if you knowingly accept the risk, set
`REQUIRE_TURNSTILE=false` to run without it.)

1. Create a Turnstile widget; put the **site key** in `.env` as `VITE_TURNSTILE_SITE_KEY`.
2. Give the function the **secret** and keep the fail-closed default:
   ```bash
   supabase secrets set TURNSTILE_SECRET_KEY=0x_your_secret REQUIRE_TURNSTILE=true
   ```
3. (Local dev only) to test live mode without Turnstile, you may
   `supabase secrets set REQUIRE_TURNSTILE=false` — never do this in production.

## Verifying the lockdown

After setup, confirm anonymous access is denied (replace URL/anon key):
```bash
# Should return [] or a permission error — NEVER your enquiries:
curl "$VITE_SUPABASE_URL/rest/v1/quote_enquiries?select=*" -H "apikey: $ANON"
```
A signed-in admin (in `app_admins`) is the only identity that can read the table
or mint a file download URL.
