import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Calculator, Printer, ScanLine, Truck, Check } from 'lucide-react'

// A simplified, friendly status journey for the marketing preview card.
const PHASES = [
  { id: 'uploaded', label: 'Uploaded', icon: Upload },
  { id: 'estimated', label: 'Estimated', icon: Calculator },
  { id: 'printing', label: 'Printing', icon: Printer },
  { id: 'qc', label: 'Quality Check', icon: ScanLine },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
]

/**
 * Self-animating "live job" card for the hero. Advances through the print
 * journey on a timer to show the product without any interaction.
 */
export default function JobStatusPreview() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % PHASES.length), 1800)
    return () => clearInterval(t)
  }, [])

  const ActiveIcon = PHASES[active].icon
  const progress = ((active + 1) / PHASES.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="card relative w-full max-w-sm overflow-hidden p-5 shadow-lift"
    >
      {/* header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Live job</p>
        <div className="flex items-center gap-2">
          <p className="font-display text-lg font-semibold text-ink">PR-1042 · 24× Keyrings</p>
          <span className="chip bg-emerald-100 text-emerald-700">On track</span>
        </div>
      </div>

      {/* animated current phase (dark ink panel) */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink p-4 text-paper-light">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
          <AnimatePresence mode="wait">
            <motion.span
              key={PHASES[active].id}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveIcon size={22} />
            </motion.span>
          </AnimatePresence>
        </span>
        <div>
          <p className="text-xs text-paper/60">Current status</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={PHASES[active].label}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-lg font-semibold"
            >
              {PHASES[active].label}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-dark">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* step dots */}
      <div className="mt-4 flex items-center justify-between">
        {PHASES.map((p, i) => {
          const done = i < active
          const isActive = i === active
          const Icon = p.icon
          return (
            <div key={p.id} className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  done
                    ? 'bg-emerald-100 text-emerald-600'
                    : isActive
                      ? 'bg-brand-500 text-white'
                      : 'bg-paper-dark text-ink-soft'
                }`}
              >
                {done ? <Check size={15} /> : <Icon size={15} />}
              </span>
              <span
                className={`hidden text-[10px] font-medium sm:block ${
                  isActive ? 'text-ink' : 'text-ink-soft'
                }`}
              >
                {p.label}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
