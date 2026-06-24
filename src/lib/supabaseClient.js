// ===========================================================================
// Supabase client (optional)
// ===========================================================================
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the environment.
// If BOTH are present we create a real client; otherwise the app runs in
// DEMO / MOCK mode and `supabase` stays null. The data layer (mockDb.js) checks
// `isSupabaseConfigured` to decide which path to use.
//
// To go live later:
//   1. Create a Supabase project.
//   2. Run the SQL in README (profiles / jobs / saved_preferences / messages).
//   3. Create a public storage bucket named `print-files`.
//   4. Put the URL + anon key in a `.env` file (see .env.example).

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
