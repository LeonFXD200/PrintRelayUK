// ===========================================================================
// Cloudflare Turnstile — bot protection (placeholder-safe, disabled by default)
// ===========================================================================
// Renders the Turnstile challenge ONLY when VITE_TURNSTILE_SITE_KEY is set.
// In demo mode (no key) it renders nothing and loads NO third-party script, so
// the app keeps its "no external requests" guarantee. The form treats an
// unconfigured Turnstile as "not required" (see validateQuote `turnstileRequired`).
//
// To enable later:
//   1. Create a Turnstile widget at https://dash.cloudflare.com/?to=/:account/turnstile
//   2. Put the site key in .env as VITE_TURNSTILE_SITE_KEY=...
//   3. Put the secret key as a Supabase function secret (TURNSTILE_SECRET_KEY)
//      so the edge function can verify tokens server-side.

import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
export const turnstileConfigured = Boolean(SITE_KEY)

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

// Load the Turnstile script exactly once.
let scriptPromise = null
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * @param {(token: string) => void} onVerify  - called with the token on success
 * @param {() => void} [onExpire]             - called when a token expires
 */
export default function TurnstileWidget({ onVerify, onExpire }) {
  const ref = useRef(null)
  const widgetId = useRef(null)

  useEffect(() => {
    if (!turnstileConfigured) return
    let cancelled = false

    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: 'light',
          callback: (token) => onVerify?.(token),
          'expired-callback': () => onExpire?.(),
          'error-callback': () => onExpire?.(),
        })
      })
      .catch(() => {
        /* network blocked — form still works, token simply stays empty */
      })

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current)
        } catch {
          /* ignore */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!turnstileConfigured) return null

  return (
    <div>
      <span className="field-label">Verification</span>
      <div ref={ref} />
    </div>
  )
}
