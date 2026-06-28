import { describe, it, expect } from 'vitest'
import { resolveAuthRedirect } from './authRedirect.js'

describe('resolveAuthRedirect (race-safe post-login routing)', () => {
  it('does NOT navigate while the admin role is still resolving', () => {
    // The core race case: a session exists but is_admin() has not resolved yet.
    expect(
      resolveAuthRedirect({ resolving: true, isAuthed: true, isAdmin: false, from: '/dashboard' }),
    ).toBeNull()
    // Even if isAdmin momentarily reads true, `resolving` must still block nav.
    expect(
      resolveAuthRedirect({ resolving: true, isAuthed: true, isAdmin: true, from: '/admin' }),
    ).toBeNull()
  })

  it('stays on the login page when unauthenticated', () => {
    expect(resolveAuthRedirect({ resolving: false, isAuthed: false, isAdmin: false })).toBeNull()
  })

  it('sends a resolved admin to /admin', () => {
    expect(
      resolveAuthRedirect({ resolving: false, isAuthed: true, isAdmin: true, from: '/dashboard' }),
    ).toBe('/admin')
  })

  it('sends a resolved non-admin to their requested destination', () => {
    expect(
      resolveAuthRedirect({ resolving: false, isAuthed: true, isAdmin: false, from: '/dashboard' }),
    ).toBe('/dashboard')
  })

  it('never routes a non-admin to /admin, even if that was the origin', () => {
    expect(
      resolveAuthRedirect({ resolving: false, isAuthed: true, isAdmin: false, from: '/admin' }),
    ).toBe('/dashboard')
  })

  it('defaults a non-admin with no origin to /dashboard', () => {
    expect(resolveAuthRedirect({ resolving: false, isAuthed: true, isAdmin: false })).toBe('/dashboard')
  })
})
