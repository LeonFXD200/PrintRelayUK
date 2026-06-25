import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Save,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Loader2,
  FileBox,
  Zap,
  Tag,
} from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'
import { Select, NumberField, TextField } from '../ui/Field.jsx'
import { STATUS_OPTIONS } from '../../data/statuses.js'
import { printers } from '../../data/printers.js'
import { getMaterial } from '../../data/materials.js'
import { formatGBP, formatBytes, formatHours, formatDate } from '../../utils/format.js'

/**
 * Editable admin row for a single job. All edits are local until "Save",
 * then bubbled up via onUpdate(id, patch).
 */
export default function AdminJobRow({ job, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({
    status: job.status,
    printer_profile: job.printer_profile,
    estimated_total: job.estimated_total,
    tracking_number: job.tracking_number || '',
    admin_notes: job.admin_notes || '',
  })

  const material = getMaterial(job.material)
  const dirty =
    draft.status !== job.status ||
    draft.printer_profile !== job.printer_profile ||
    draft.estimated_total !== job.estimated_total ||
    draft.tracking_number !== (job.tracking_number || '') ||
    draft.admin_notes !== (job.admin_notes || '')

  async function save(patch = draft) {
    setSaving(true)
    await onUpdate(job.id, patch)
    setSaving(false)
  }

  // Quick actions also persist immediately.
  async function quick(patch) {
    setDraft((d) => ({ ...d, ...patch }))
    await save({ ...draft, ...patch })
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
      >
        <span className="font-mono text-sm font-semibold text-brand-600">{job.id}</span>
        <StatusBadge statusId={draft.status} />
        {job.urgent && (
          <span className="chip bg-brand-50 text-brand-700">
            <Zap size={12} /> Urgent
          </span>
        )}
        {job.white_label && (
          <span className="chip bg-ink/[0.06] text-ink-soft">
            <Tag size={12} /> WL
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm text-ink-light">{job.file_name}</span>
        <span className="text-sm font-semibold text-ink">{formatGBP(draft.estimated_total)}</span>
        <ChevronDown size={18} className={`text-ink-soft transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="grid gap-5 border-t border-ink/10 p-5 lg:grid-cols-2">
              {/* file metadata + spec (read-only) */}
              <div className="space-y-3">
                <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  File metadata
                </h4>
                <div className="rounded-xl bg-paper-dark p-3 text-sm">
                  <p className="flex items-center gap-2 text-ink">
                    <FileBox size={15} className="text-brand-600" /> {job.file_name}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-ink-soft">
                    <span>Size: {formatBytes(job.file_size)}</span>
                    <span>Created: {formatDate(job.created_at)}</span>
                    <span>
                      Material: {material.name} · {job.colour}
                    </span>
                    <span>Qty: ×{job.quantity}</span>
                    <span>Layer: {job.layer_height} mm</span>
                    <span>Infill: {job.infill}%</span>
                    <span>Est. weight: {job.estimated_grams} g</span>
                    <span>Est. time: {formatHours(job.estimated_hours)}</span>
                  </div>
                </div>

                {/* quick actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => quick({ status: 'issue' })}
                    className="btn-ghost px-3 py-2 text-xs text-red-600"
                  >
                    <AlertTriangle size={14} /> Mark issue
                  </button>
                  <button
                    onClick={() => quick({ status: 'dispatched' })}
                    className="btn-ghost px-3 py-2 text-xs"
                  >
                    <Truck size={14} /> Dispatched
                  </button>
                  <button
                    onClick={() => quick({ status: 'complete' })}
                    className="btn-ghost px-3 py-2 text-xs text-emerald-700"
                  >
                    <CheckCircle2 size={14} /> Complete
                  </button>
                </div>
              </div>

              {/* editable fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Status"
                    value={draft.status}
                    onChange={(v) => setDraft({ ...draft, status: v })}
                    options={STATUS_OPTIONS}
                  />
                  <Select
                    label="Assign printer"
                    value={draft.printer_profile}
                    onChange={(v) => setDraft({ ...draft, printer_profile: v })}
                    options={printers.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Edit price (£)"
                    value={draft.estimated_total}
                    onChange={(v) => setDraft({ ...draft, estimated_total: v })}
                    min={0}
                    max={100000}
                    step={0.5}
                  />
                  <TextField
                    label="Tracking number"
                    value={draft.tracking_number}
                    onChange={(v) => setDraft({ ...draft, tracking_number: v })}
                    placeholder="e.g. AB123456789GB"
                  />
                </div>
                <label className="block">
                  <span className="field-label">Quote / admin notes</span>
                  <textarea
                    className="field min-h-[70px] resize-y"
                    value={draft.admin_notes}
                    onChange={(e) => setDraft({ ...draft, admin_notes: e.target.value })}
                    placeholder="Internal notes, quote adjustments, customer messages…"
                  />
                </label>
                <button
                  onClick={() => save()}
                  disabled={!dirty || saving}
                  className="btn-primary w-full py-2.5"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
