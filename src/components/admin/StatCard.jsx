import { motion } from 'framer-motion'

/**
 * Compact metric card for the admin dashboard.
 */
export default function StatCard({ icon: Icon, label, value, sublabel, tone = 'brand', delay = 0 }) {
  const tones = {
    brand: 'bg-pine-50 text-pine-600',
    ember: 'bg-clay-50 text-clay-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-ink/[0.05] text-ink-soft',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card p-5"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-sm font-medium text-ink-light">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-ink-soft">{sublabel}</p>}
    </motion.div>
  )
}
