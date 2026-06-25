import { Check, AlertTriangle, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { TIMELINE_STEPS, getStatus } from '../data/statuses.js'

/**
 * Vertical (or horizontal) timeline of job statuses.
 * Highlights every step up to and including the current status.
 *
 * @param {string} currentStatus  status id
 * @param {boolean} horizontal     render inline (used on cards / hero preview)
 */
export default function StatusTimeline({ currentStatus, horizontal = false }) {
  const current = getStatus(currentStatus)

  const isIssue = current?.id === 'issue'
  const isCancelled = current?.id === 'cancelled'
  const currentOrder = current?.order ?? 0

  if (horizontal) {
    return (
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-3">
        {TIMELINE_STEPS.map((step, i) => {
          const done = step.order < currentOrder
          const active = step.order === currentOrder
          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                    done
                      ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/30'
                      : active
                        ? 'bg-steel-500 text-white ring-steel-400'
                        : 'bg-ink/[0.05] text-ink-soft ring-ink/10'
                  }`}
                >
                  {done ? <Check size={13} /> : i + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    active ? 'text-ink' : done ? 'text-ink-light' : 'text-ink-soft'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && <span className="mx-2 h-px w-5 bg-ink/15" />}
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="relative space-y-1">
      {TIMELINE_STEPS.map((step) => {
        const done = step.order < currentOrder
        const active = step.order === currentOrder && !isIssue && !isCancelled
        return (
          <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            <div className="absolute left-[11px] top-6 h-full w-px bg-ink/10 last:hidden" />
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${
                done
                  ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/30'
                  : active
                    ? 'bg-steel-500 text-white ring-steel-400'
                    : 'bg-paper-dark text-ink-soft ring-ink/10'
              }`}
            >
              {done ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  active ? 'text-ink' : done ? 'text-ink-light' : 'text-ink-soft'
                }`}
              >
                {step.label}
              </p>
              {active && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-steel-600"
                >
                  In progress
                </motion.p>
              )}
            </div>
          </li>
        )
      })}

      {(isIssue || isCancelled) && (
        <li className="relative flex gap-3">
          <span
            className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${
              isIssue
                ? 'bg-red-100 text-red-700 ring-red-500/30'
                : 'bg-ink/[0.05] text-ink-soft ring-ink/15'
            }`}
          >
            {isIssue ? <AlertTriangle size={13} /> : <X size={13} />}
          </span>
          <p className="pt-0.5 text-sm font-semibold text-ink">{current.label}</p>
        </li>
      )}
    </ol>
  )
}
