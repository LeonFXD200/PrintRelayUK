import { motion } from 'framer-motion'

/**
 * Lightweight, dependency-free horizontal bar chart.
 * @param {{label:string, value:number}[]} data
 * @param {string} unit  optional suffix shown after each value
 */
export default function BarChart({ data, unit = '', accent = 'brand' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const colour = accent === 'ember' ? 'from-brand-500 to-brand-400' : 'from-steel-500 to-steel-400'

  if (!data.length) {
    return <p className="py-6 text-center text-sm text-ink-soft">No data yet.</p>
  }

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-ink-light">{d.label}</span>
            <span className="font-semibold text-ink">
              {d.value}
              {unit}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${colour}`}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
