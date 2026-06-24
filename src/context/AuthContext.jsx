// ===========================================================================
// AuthContext — demo authentication
// ===========================================================================
// In mock mode this validates against the demo users and persists the signed-in
// user in localStorage. In Supabase mode the same methods would call
// supabase.auth.signInWithPassword / signUp / signOut and read the profile row.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers } from '../data/users.js'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'pr_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore any previously signed-in demo user on first load.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  function persist(u) {
    setUser(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  // Email/password sign-in (demo). Returns { error } on failure.
  async function login(email, password) {
    // Supabase: await supabase.auth.signInWithPassword({ email, password })
    const found = demoUsers.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase().trim(),
    )
    if (!found || found.password !== password) {
      return { error: 'Invalid email or password. Try a demo login below.' }
    }
    const { password: _pw, ...safe } = found
    persist(safe)
    return { user: safe }
  }

  // One-click demo login by role.
  async function loginAsRole(role) {
    const found = demoUsers.find((u) => u.role === role)
    if (!found) return { error: 'No demo account for that role.' }
    const { password: _pw, ...safe } = found
    persist(safe)
    return { user: safe }
  }

  // Register (demo) — creates an in-memory customer/seller and signs them in.
  async function register({ full_name, email, company_name, role = 'customer', business_type }) {
    // Supabase: await supabase.auth.signUp(...) then insert into profiles
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
    persist(safe)
    return { user: safe }
  }

  function logout() {
    // Supabase: await supabase.auth.signOut()
    persist(null)
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
