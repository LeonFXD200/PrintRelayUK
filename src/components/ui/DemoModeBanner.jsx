import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'

/**
 * Thin banner shown only in demo/mock mode (no Supabase keys configured),
 * so portfolio viewers immediately understand the data is mocked.
 */
export default function DemoModeBanner() {
  const [hidden, setHidden] = useState(false)
  if (isSupabaseConfigured || hidden) return null

  return (
    <div className="border-b border-pine-500/15 bg-pine-50">
      <div className="section flex items-center justify-between gap-3 py-2 text-xs text-pine-800">
        <p className="flex items-center gap-2">
          <Info size={14} className="shrink-0 text-pine-600" />
          <span>
            <strong className="font-semibold">Demo mode.</strong> Sample data, no real backend. Try
            the demo logins on the sign-in page (customer, seller or admin).
          </span>
        </p>
        <button
          onClick={() => setHidden(true)}
          className="rounded p-1 text-pine-700 hover:bg-pine-500/10"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
