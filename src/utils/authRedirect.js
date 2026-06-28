// ---------------------------------------------------------------------------
// Race-safe post-login redirect decision
// ---------------------------------------------------------------------------
// Pure, framework-free so it can be unit-tested in isolation. The login page
// (Auth.jsx) calls this on every render and only navigates when it returns a
// path. The key safety property: while the Supabase session's admin role is
// still being resolved (`resolving`), it returns null so we NEVER route a user
// before we know whether they are an admin — an authenticated non-admin is
// therefore never sent to /admin, even transiently.
//
// @param {object}  state
// @param {boolean} state.resolving  auth/admin-role check still in flight
// @param {boolean} state.isAuthed   a session exists
// @param {boolean} state.isAdmin    the session is an allow-listed admin
// @param {string}  [state.from]     the route the user originally wanted
// @returns {string|null} destination path, or null to stay put (don't navigate)

export function resolveAuthRedirect({ resolving, isAuthed, isAdmin, from = '/dashboard' }) {
  if (resolving) return null // role still resolving → do NOT navigate yet
  if (!isAuthed) return null // unauthenticated → stay on /login
  if (isAdmin) return '/admin' // allow-listed admin → admin dashboard
  // Authenticated non-admin: go to the safe normal destination, but never
  // /admin (e.g. if they were bounced here from a direct /admin visit).
  return from === '/admin' ? '/dashboard' : from
}
