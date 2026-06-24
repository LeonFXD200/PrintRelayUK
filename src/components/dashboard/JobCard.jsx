import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Repeat, Truck, Package, Zap, Tag } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'
import StatusTimeline from '../StatusTimeline.jsx'
import { getMaterial } from '../../data/materials.js'
import { getPrinter } from '../../data/printers.js'
import { formatGBP, formatDate, formatHours } from '../../utils/format.js'

/**
 * Expandable job card for the customer dashboard.
 * @param {object} job
 * @param {function} onReorder  optional callback for the reorder button
 */
export default function JobCard({ job, onReorder }) {
  const [open, setOpen] = useState(false)
  const material = getMaterial(job.material)
  const printer = getPrinter(job.printer_profile)

  return (
    <div className="card overflow-hidden">
      {/* header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-clay-600">{job.id}</span>
            <StatusBadge statusId={job.status} />
            {job.urgent && (
              <span className="chip bg-clay-50 text-clay-700">
                <Zap size={12} /> Urgent
              </span>
            )}
            {job.white_label && (
              <span className="chip bg-ink/[0.06] text-ink-soft">
                <Tag size={12} /> White-label
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-medium text-ink">{job.file_name}</p>
          <p className="text-xs text-ink-soft">
            {material.name} · {job.colour} · ×{job.quantity} · {formatDate(job.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-ink">
            {formatGBP(job.estimated_total)}
          </p>
          <p className="text-xs text-ink-soft">est. total</p>
        </div>
        <ChevronDown
          size={20}
          className={`text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid gap-6 border-t border-ink/10 p-5 md:grid-cols-2">
              {/* timeline */}
              <div>
                <h4 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Job status
                </h4>
                <StatusTimeline currentStatus={job.status} />
              </div>

              {/* details */}
              <div className="space-y-3">
                <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Specification
                </h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <Detail label="Printer" value={printer.name} />
                  <Detail label="Layer height" value={`${job.layer_height} mm`} />
                  <Detail label="Infill" value={`${job.infill}%`} />
                  <Detail label="Est. print time" value={formatHours(job.estimated_hours)} />
                  <Detail label="Est. weight" value={`${job.estimated_grams} g`} />
                  <Detail label="Postcode" value={job.postcode || 'n/a'} />
                </dl>

                {/* tracking */}
                <div className="rounded-xl bg-paper-dark p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                    <Truck size={13} /> Tracking number
                  </p>
                  <p className="mt-0.5 font-mono text-sm text-ink">
                    {job.tracking_number || 'Added once dispatched'}
                  </p>
                </div>

                {job.admin_notes && (
                  <div className="rounded-xl bg-paper-dark p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                      <Package size={13} /> Notes
                    </p>
                    <p className="mt-0.5 text-sm text-ink-light">{job.admin_notes}</p>
                  </div>
                )}

                {onReorder && (
                  <button onClick={() => onReorder(job)} className="btn-ghost w-full">
                    <Repeat size={16} /> Reorder this job
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  )
}
