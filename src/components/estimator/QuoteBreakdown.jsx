import { motion } from 'framer-motion'
import { Clock, Weight, Info } from 'lucide-react'
import { formatGBP, formatHours } from '../../utils/format.js'

// One line of the itemised breakdown.
function Row({ label, value, hint, accent }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className={`flex items-center gap-1.5 ${accent ? 'text-clay-600' : 'text-ink-soft'}`}>
        {label}
        {hint && <span className="text-xs text-ink-soft/70">({hint})</span>}
      </span>
      <span className={`font-semibold ${accent ? 'text-clay-600' : 'text-ink'}`}>
        {formatGBP(value)}
      </span>
    </div>
  )
}

/**
 * Animated, transparent price breakdown card. Renders the full estimate
 * returned by estimatePrint().
 */
export default function QuoteBreakdown({ estimate }) {
  if (!estimate) return null
  const { breakdown, rates, subtotal, total, estimatedGrams, estimatedHours } = estimate

  return (
    <motion.div
      key={total} /* re-animate whenever the total changes */
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card overflow-hidden"
    >
      {/* headline numbers (dark ink panel) */}
      <div className="bg-ink p-5 text-paper-light">
        <p className="text-xs font-semibold uppercase tracking-wider text-paper/60">
          Estimated total
        </p>
        <div className="mt-1 flex items-end gap-2">
          <motion.span
            key={total}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-4xl font-semibold"
          >
            {formatGBP(total)}
          </motion.span>
          <span className="mb-1 text-sm text-paper/60">inc. shipping</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-paper/10 p-3">
            <p className="flex items-center gap-1.5 text-xs text-paper/60">
              <Weight size={13} /> Material
            </p>
            <p className="mt-0.5 font-bold">{estimatedGrams} g</p>
          </div>
          <div className="rounded-xl bg-paper/10 p-3">
            <p className="flex items-center gap-1.5 text-xs text-paper/60">
              <Clock size={13} /> Print time
            </p>
            <p className="mt-0.5 font-bold">{formatHours(estimatedHours)}</p>
          </div>
        </div>
      </div>

      {/* itemised breakdown */}
      <div className="divide-y divide-ink/[0.08] px-5">
        <div className="py-1">
          <Row label="Material cost" value={breakdown.materialCost} />
          <Row label="Machine time" value={breakdown.machineCost} />
          <Row label="Setup &amp; handling" value={breakdown.setupCost} />
          <Row label="Packaging" value={breakdown.packagingCost} />
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="font-semibold text-ink">Production subtotal</span>
          <span className="font-semibold text-ink">{formatGBP(subtotal)}</span>
        </div>
        <div className="py-1">
          <Row
            label="Failure-risk allowance"
            hint={`${rates.failureRiskRate}%`}
            value={breakdown.failureRiskCost}
          />
          <Row label="Margin" hint={`${rates.marginRate}%`} value={breakdown.margin} />
          {breakdown.urgencyFee > 0 && (
            <Row
              label="Urgency fee"
              hint={`+${rates.urgencyRate}%`}
              value={breakdown.urgencyFee}
              accent
            />
          )}
          <Row label="Shipping" value={breakdown.shippingCost} />
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-base font-bold text-ink">Total</span>
          <span className="font-display text-xl font-semibold text-clay-600">
            {formatGBP(total)}
          </span>
        </div>
      </div>

      {/* disclaimer */}
      <div className="flex items-start gap-2 border-t border-ink/[0.08] bg-paper-dark p-4 text-xs text-ink-soft">
        <Info size={15} className="mt-0.5 shrink-0 text-ink-soft" />
        <p>
          This is an estimate. Final pricing may change after file review, failed-print risk or
          special requirements.
        </p>
      </div>
    </motion.div>
  )
}
