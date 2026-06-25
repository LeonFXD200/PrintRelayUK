import { getStatus } from '../../data/statuses.js'

// Maps a status "tone" to badge colours (light theme). Full class strings so
// Tailwind's JIT compiler can see them.
const TONES = {
  slate: 'bg-ink/[0.06] text-ink-soft ring-ink/10',
  brand: 'bg-steel-50 text-steel-700 ring-steel-600/20',
  amber: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  red: 'bg-red-100 text-red-700 ring-red-500/20',
}

/**
 * Small pill showing a job's status. Pass either a `statusId` or `tone`+`label`.
 */
export default function StatusBadge({ statusId, label, tone, className = '' }) {
  const status = statusId ? getStatus(statusId) : null
  const resolvedTone = tone || status?.tone || 'slate'
  const resolvedLabel = label || status?.label || statusId

  return (
    <span className={`chip ring-1 ${TONES[resolvedTone] || TONES.slate} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {resolvedLabel}
    </span>
  )
}
