// ===========================================================================
// AuthContext
// ===========================================================================
// Two modes, chosen automatically by whether Supabase keys are present:
//
//   DEMO  (no keys):  validates against local demo users, persists the signed-in
//                     user in localStorage. Used for the offline portfolio demo.
//
//   LIVE  (Supabase): real Supabase Auth. Admin access is decided SERVER-SIDE by
//                     the is_admin() SQL function (the app_admins allow-list),
//                     not by anything in the browser. Public sign-up is disabled
//                     and one-click demo logins are turned off.
//
// Either way, /admin is also protected at the database layer by RLS, so the
// client gating here is convenience, not the security boundary.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers } from '../data/users.js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'pr_auth_user'

// Build the app user object from a Supabase session + server-side admin flag.
function userFromSession(session, isAdmin) {
  if (!session?.user) return null
  return {
    id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata?.full_name || session.user.email,
    role: isAdmin ? 'admin' : 'customer',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ----- LIVE: Supabase Auth session + server-side admin check ---------------
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    let active = true

    async function hydrate(session) {
      if (!session?.user) {
        if (active) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      // Ask the database whether this account is an admin (app_admins allow-list).
      let admin = false
      try {
        const { data } = await supabase.rpc('is_admin')
        admin = Boolean(data)
      } catch {
        admin = false
      }
      if (active) {
        setUser(userFromSession(session, admin))
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => hydrate(session))
    return () => {
      active = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  // ----- DEMO: restore the previously signed-in demo user --------------------
  useEffect(() => {
    if (isSupabaseConfigured) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false)
  }, [])

  function persistDemo(u) {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  // Email/password sign-in. Returns { error } on failure.
  async function login(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(email).trim(),
        password,
      })
      if (error) return { error: error.message }
      // onAuthStateChange hydrates the user (incl. the admin check).
      return {}
    }
    // demo
    const found = demoUsers.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase().trim(),
    )
    if (!found || found.password !== password) {
      return { error: 'Invalid email or password. Try a demo login below.' }
    }
    const { password: _pw, ...safe } = found
    persistDemo(safe)
    return { user: safe }
  }

  // One-click demo login by role (demo mode only).
  async function loginAsRole(role) {
    if (isSupabaseConfigured) {
      return { error: 'One-click demo logins are disabled in live mode. Sign in with your account.' }
    }
    const found = demoUsers.find((u) => u.role === role)
    if (!found) return { error: 'No demo account for that role.' }
    const { password: _pw, ...safe } = found
    persistDemo(safe)
    return { user: safe }
  }

  // Register. Public sign-up is DISABLED in live mode (hardening); demo only.
  async function register({ full_name, email, company_name, role = 'customer', business_type }) {
    if (isSupabaseConfigured) {
      return {
        error: 'Public sign-up is disabled. Please use the quote form to get in touch.',
      }
    }
    const exists = demoUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { error: 'That email is already used by a demo account.' }
    }
    const safe = {
      id: `${role}-${Math.floor(performance.now() % 9000)}`,
      full_name,
      email,
      company_name: company_name || '',
      role,
      business_type: business_type || '',
    }
    persistDemo(safe)
    return { user: safe }
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
      setUser(null)
      return
    }
    persistDemo(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isSupabaseConfigured,
      isAuthed: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      loginAsRole,
      register,
      logout,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
