import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Save,
  Loader2,
  Mail,
  Phone,
  Building2,
  FileBox,
  Download,
  CalendarClock,
  PoundSterling,
  Boxes,
  Palette,
  Ruler,
} from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'
import { Select } from '../ui/Field.jsx'
import {
  ENQUIRY_STATUS_OPTIONS,
  getEnquiryStatus,
} from '../../data/enquiryStatuses.js'
import { getMaterial } from '../../data/materials.js'
import { getEnquiryFileUrl } from '../../lib/mockDb.js'
import { formatBytes, formatDate, formatGBP } from '../../utils/format.js'

function materialLabel(id) {
  if (!id || id === 'not-sure') return 'Not sure / advise me'
  return getMaterial(id).name
}

// One small fact in the detail grid.
function Fact({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <p className="flex items-start gap-2 text-sm text-ink-soft">
      <Icon size={15} className="mt-0.5 shrink-0 text-brand-600" />
      <span>
        <span className="text-ink-soft/80">{label}: </span>
        <span className="text-ink">{children}</span>
      </span>
    </p>
  )
}

/**
 * Admin row for a single quote enquiry: collapsed summary + an expandable detail
 * with contact, project info and a secure (signed-URL) file download.
 *
 * Phase 2A is READ-ONLY — `readOnly` defaults to true: the status select, quick
 * actions, internal-notes editor and Save button are hidden, and status / quote
 * price / notes are shown as plain text. The editable branch is preserved behind
 * `!readOnly` (and only then is `onUpdate` used) so a later phase can re-enable it.
 */
export default function AdminEnquiryRow({ enquiry, onUpdate, readOnly = true }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [fileMsg, setFileMsg] = useState('')
  const [draft, setDraft] = useState({
    status: enquiry.status,
    admin_notes: enquiry.admin_notes || '',
  })

  const status = getEnquiryStatus(readOnly ? enquiry.status : draft.status)
  const dirty =
    draft.status !== enquiry.status || draft.admin_notes !== (enquiry.admin_notes || '')
  const hasFile = Boolean(enquiry.file_name)
  const hasQuote = enquiry.quote_price !== null && enquiry.quote_price !== undefined

  async function save(patch = draft) {
    if (!onUpdate) return
    setSaving(true)
    await onUpdate(enquiry.id, patch)
    setSaving(false)
  }

  async function quickStatus(next) {
    setDraft((d) => ({ ...d, status: next }))
    await save({ ...draft, status: next })
  }

  async function downloadFile() {
    setFileMsg('')
    setDownloading(true)
    try {
      const url = await getEnquiryFileUrl(enquiry)
      if (!url) {
        setFileMsg('File not available to download in demo mode (metadata only was kept).')
        return
      }
      const a = document.createElement('a')
      a.href = url
      a.download = enquiry.file_name || 'model'
      a.target = '_blank'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-sm font-semibold text-brand-600">
          {enquiry.reference || enquiry.id}
        </span>
        <StatusBadge tone={status.tone} label={status.label} />
        {enquiry.source === 'estimator' && (
          <span className="chip bg-brand-50 text-brand-700">From estimator</span>
        )}
        {hasFile && (
          <span className="chip bg-ink/[0.06] text-ink-soft">
            <FileBox size={12} /> File
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm text-ink-light">
          <span className="font-medium text-ink">{enquiry.name}</span>
          <span className="text-ink-soft"> — {enquiry.what_printed}</span>
        </span>
        {hasQuote && (
          <span className="text-xs font-semibold text-emerald-700">
            {formatGBP(Number(enquiry.quote_price))}
          </span>
        )}
        <span className="text-xs text-ink-soft">{formatDate(enquiry.created_at)}</span>
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
              {/* contact + project (read-only) */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Contact
                  </h4>
                  <div className="space-y-1.5 rounded-xl bg-paper-dark p-3">
                    {/* Plain selectable text — no mailto/tel, by design. */}
                    <Fact icon={Mail} label="Email">
                      <span className="select-all break-all">{enquiry.email}</span>
                    </Fact>
                    <Fact icon={Phone} label="Phone">
                      <span className="select-all">{enquiry.phone}</span>
                    </Fact>
                    <Fact icon={Building2} label="Business">
                      {enquiry.business_name}
                    </Fact>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Project
                  </h4>
                  <div className="space-y-1.5 rounded-xl bg-paper-dark p-3">
                    <p className="text-sm text-ink">{enquiry.what_printed}</p>
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      <Fact icon={Boxes} label="Quantity">
                        {enquiry.quantity}
                      </Fact>
                      <Fact icon={Palette} label="Material">
                        {materialLabel(enquiry.material)}
                        {enquiry.colour ? ` · ${enquiry.colour}` : ''}
                      </Fact>
                      <Fact icon={Ruler} label="Dimensions">
                        {enquiry.dimensions}
                      </Fact>
                      <Fact icon={CalendarClock} label="Deadline">
                        {enquiry.deadline ? formatDate(enquiry.deadline) : ''}
                      </Fact>
                      <Fact icon={PoundSterling} label="Budget">
                        {enquiry.budget}
                      </Fact>
                    </div>
                    {enquiry.notes && (
                      <p className="mt-2 whitespace-pre-line border-t border-ink/10 pt-2 text-xs text-ink-soft">
                        {enquiry.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* file */}
                {hasFile && (
                  <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                      <FileBox size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{enquiry.file_name}</p>
                      <p className="text-xs text-ink-soft">{formatBytes(enquiry.file_size)}</p>
                    </div>
                    <button onClick={downloadFile} disabled={downloading} className="btn-ghost px-3 py-2 text-xs">
                      {downloading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      Download
                    </button>
                  </div>
                )}
                {fileMsg && <p className="text-xs text-amber-700">{fileMsg}</p>}
              </div>

              {/* right column: read-only summary (Phase 2A) or editable controls */}
              {readOnly ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Quote &amp; status
                    </h4>
                    <div className="space-y-2 rounded-xl bg-paper-dark p-3">
                      <Fact icon={PoundSterling} label="Quote price">
                        {hasQuote ? formatGBP(Number(enquiry.quote_price)) : '—'}
                      </Fact>
                      <p className="flex items-center gap-2 text-sm text-ink-soft">
                        <span className="text-ink-soft/80">Status:</span>
                        <StatusBadge tone={status.tone} label={status.label} />
                      </p>
                      <p className="text-xs text-ink-soft/80">{status.hint}</p>
                    </div>
                  </div>

                  {enquiry.admin_notes && (
                    <div>
                      <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        Internal notes
                      </h4>
                      <p className="whitespace-pre-line rounded-xl bg-paper-dark p-3 text-sm text-ink-soft">
                        {enquiry.admin_notes}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-ink-soft/70">
                    Read-only view — status, pricing and notes editing returns in a later phase.
                  </p>
                </div>
              ) : (
                /* editable: status + notes (preserved for a later phase) */
                <div className="space-y-3">
                  <Select
                    label="Status"
                    value={draft.status}
                    onChange={(v) => setDraft({ ...draft, status: v })}
                    options={ENQUIRY_STATUS_OPTIONS}
                    hint={status.hint}
                  />

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => quickStatus('contacted')} className="btn-ghost px-3 py-2 text-xs">
                      Mark contacted
                    </button>
                    <button onClick={() => quickStatus('quoted')} className="btn-ghost px-3 py-2 text-xs">
                      Mark quoted
                    </button>
                    <button
                      onClick={() => quickStatus('accepted')}
                      className="btn-ghost px-3 py-2 text-xs text-emerald-700"
                    >
                      Accepted
                    </button>
                    <button
                      onClick={() => quickStatus('declined')}
                      className="btn-ghost px-3 py-2 text-xs text-red-600"
                    >
                      Declined
                    </button>
                  </div>

                  <label className="block">
                    <span className="field-label">Internal notes</span>
                    <textarea
                      className="field min-h-[110px] resize-y"
                      value={draft.admin_notes}
                      onChange={(e) => setDraft({ ...draft, admin_notes: e.target.value })}
                      placeholder="Quote sent, follow-ups, special requirements…"
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
