import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'

export default function DemoModeBanner() {
  const [hidden, setHidden] = useState(false)
  if (isSupabaseConfigured || hidden) return null

  return (
    <div className="border-b border-steel-500/15 bg-steel-50">
      <div className="section flex items-center justify-between gap-3 py-2 text-xs text-steel-800">
        <p className="flex items-center gap-2">
          <Info size={14} className="shrink-0 text-steel-600" />
          <span>Instant estimates. Final pricing confirmed after file review.</span>
        </p>
        <button
          onClick={() => setHidden(true)}
          className="rounded p-1 text-steel-700 hover:bg-steel-500/10"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
