import { motion } from 'framer-motion'

/**
 * Consistent page hero/header used on the inner content pages.
 */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-b from-brand-50/60 to-paper-light">
      {/* faint grid backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:42px_42px] opacity-60" />
      <div className="section relative py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{subtitle}</p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>
    </div>
  )
}
