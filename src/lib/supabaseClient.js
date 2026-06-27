// ===========================================================================
// Supabase client (optional)
// ===========================================================================
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the environment.
// If BOTH are present we create a real client; otherwise the app runs in
// DEMO / MOCK mode and `supabase` stays null. The data layer (mockDb.js) checks
// `isSupabaseConfigured` to decide which path to use.
//
// To go live later (see README + supabase/README.md):
//   1. Create a Supabase project.
//   2. Run the SQL migrations in supabase/migrations/.
//   3. Deploy the `submit-enquiry` Edge Function.
//   4. Put the URL + anon key in a `.env` file (see .env.example).
//
// The anon key is safe to expose in the browser. The service-role key, Resend
// API key and Turnstile SECRET are NEVER in frontend code or VITE_ variables —
// they exist only as Edge Function secrets on the server.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Only instantiate when configured so demo mode never makes a network call.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Helpful one-time hint for developers running the demo.
  // eslint-disable-next-line no-console
  console.info(
    '[PrintRelay UK] Running in DEMO mode — no Supabase keys found. ' +
      'Copy .env.example to .env and add keys to enable the live backend.',
  )
}
