import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  FileText,
  History,
  Settings2,
  Building2,
  Loader2,
  Plus,
  CheckCircle2,
  Inbox,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import JobCard from '../components/dashboard/JobCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { Select, Toggle, TextField } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  listJobs,
  listEstimates,
  getPreferences,
  savePreferences,
  getCompany,
  saveCompany,
  createJob,
} from '../lib/mockDb.js'
import { materials } from '../data/materials.js'
import { printers } from '../data/printers.js'
import { dispatchOptions, layerHeights, infillPresets } from '../data/options.js'
import { formatGBP, formatDate } from '../utils/format.js'

const ACTIVE_STATUSES = ['quote-requested', 'awaiting-payment', 'file-review', 'printing', 'quality-check', 'packed', 'issue']

const TABS = [
  { id: 'jobs', label: 'Jobs', icon: Package },
  { id: 'estimates', label: 'Saved estimates', icon: FileText },
  { id: 'history', label: 'History', icon: History },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
  { id: 'company', label: 'Company & white-label', icon: Building2 },
]

/**
 * Customer / seller dashboard. Tabbed view of active jobs, saved estimate
 * drafts, job history, print preferences and company / white-label settings.
 * Reads and writes everything through the mock data layer (mockDb.js).
 */
export default function CustomerDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('jobs')
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [estimates, setEstimates] = useState([])
  const [prefs, setPrefs] = useState(null)
  const [company, setCompany] = useState(null)
  const [toast, setToast] = useState('')

  // Load everything for this user.
  async function refresh() {
    const [j, e, p, c] = await Promise.all([
      listJobs(user.id),
      listEstimates(user.id),
      getPreferences(user.id),
      getCompany(user.id),
    ])
    setJobs(j)
    setEstimates(e)
    setPrefs(p || defaultPrefs())
    setCompany(c || defaultCompany(user))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const activeJobs = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status))
  const pastJobs = jobs.filter((j) => ['complete', 'dispatched', 'cancelled'].includes(j.status))

  async function handleReorder(job) {
    const { id, status, tracking_number, created_at, updated_at, ...rest } = job
    await createJob({ ...rest, user_id: user.id })
    await refresh()
    flash(`Reordered ${job.file_name} — a fresh quote request was created.`)
  }

  async function handleSavePrefs() {
    await savePreferences(user.id, prefs)
    flash('Print preferences saved.')
  }

  async function handleSaveCompany() {
    await saveCompany(user.id, company)
    flash('Company & white-label details saved.')
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Signed in as ${user.role}`}
        title={`Welcome back, ${user.full_name.split(' ')[0]}`}
        subtitle={user.company_name ? user.company_name : 'Your jobs, estimates and saved preferences in one place.'}
      >
        <Link to="/estimator" className="btn-primary">
          <Plus size={16} /> New estimate
        </Link>
      </PageHeader>

      {/* toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircle2 size={16} /> {toast}
        </motion.div>
      )}

      <div className="section py-8">
        {/* quick stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Active jobs" value={activeJobs.length} />
          <MiniStat label="Saved estimates" value={estimates.length} />
          <MiniStat label="Completed" value={pastJobs.filter((j) => j.status === 'complete' || j.status === 'dispatched').length} />
          <MiniStat
            label="Lifetime value"
            value={formatGBP(jobs.reduce((s, j) => s + (j.estimated_total || 0), 0))}
          />
        </div>

        {/* tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-ink/[0.05] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? 'bg-ink text-paper-light' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : (
          <>
            {/* JOBS */}
            {tab === 'jobs' &&
              (activeJobs.length ? (
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <JobCard key={job.id} job={job} onReorder={handleReorder} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No active jobs"
                  text="When you request a quote it'll show here so you can track it."
                />
              ))}

            {/* ESTIMATES */}
            {tab === 'estimates' &&
              (estimates.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {estimates.map((e) => (
                    <div key={e.id} className="card-glass p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-brand-600">{e.id}</span>
                        <StatusBadge statusId="draft" />
                      </div>
                      <p className="mt-1 truncate font-medium text-ink">{e.file_name}</p>
                      <p className="text-xs text-ink-soft">
                        ×{e.quantity} · {formatDate(e.created_at)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-ink">{formatGBP(e.estimated_total)}</span>
                        <Link to="/estimator" className="btn-ghost px-3 py-1.5 text-xs">
                          Open estimate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No saved estimates" text="Drafts you save from the estimator appear here." />
              ))}

            {/* HISTORY */}
            {tab === 'history' &&
              (pastJobs.length ? (
                <div className="space-y-3">
                  {pastJobs.map((job) => (
                    <JobCard key={job.id} job={job} onReorder={handleReorder} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No past jobs yet" text="Completed and dispatched jobs are archived here." />
              ))}

            {/* PREFERENCES */}
            {tab === 'preferences' && prefs && (
              <div className="card-glass max-w-2xl space-y-4 p-6">
                <h3 className="font-semibold text-ink">Default print preferences</h3>
                <p className="text-sm text-ink-soft">
                  These pre-fill the estimator to save you time on every job.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Preferred material"
                    value={prefs.material}
                    onChange={(v) => setPrefs({ ...prefs, material: v })}
                    options={materials.map((m) => ({ value: m.id, label: m.name }))}
                  />
                  <Select
                    label="Preferred printer"
                    value={prefs.printer_profile}
                    onChange={(v) => setPrefs({ ...prefs, printer_profile: v })}
                    options={printers.map((p) => ({ value: p.id, label: p.name }))}
                  />
                  <Select
                    label="Layer height"
                    value={String(prefs.layer_height)}
                    onChange={(v) => setPrefs({ ...prefs, layer_height: Number(v) })}
                    options={layerHeights.map((l) => ({ value: String(l.value), label: l.label }))}
                  />
                  <Select
                    label="Infill"
                    value={String(prefs.infill)}
                    onChange={(v) => setPrefs({ ...prefs, infill: Number(v) })}
                    options={infillPresets.map((i) => ({ value: String(i), label: `${i}%` }))}
                  />
                  <Select
                    label="Default dispatch speed"
                    value={prefs.dispatch_speed}
                    onChange={(v) => setPrefs({ ...prefs, dispatch_speed: v })}
                    options={dispatchOptions.map((d) => ({ value: d.id, label: `${d.name} (${d.window})` }))}
                  />
                  <Select
                    label="Default packaging"
                    value={prefs.packaging_type}
                    onChange={(v) => setPrefs({ ...prefs, packaging_type: v })}
                    options={[
                      { value: 'Standard recyclable', label: 'Standard recyclable' },
                      { value: 'Neutral / unbranded', label: 'Neutral / unbranded' },
                    ]}
                  />
                </div>
                <Toggle
                  label="Default to white-label packaging"
                  description="Pre-tick white-label on new estimates"
                  checked={prefs.white_label_default}
                  onChange={(v) => setPrefs({ ...prefs, white_label_default: v })}
                />
                <button onClick={handleSavePrefs} className="btn-primary">
                  Save preferences
                </button>
              </div>
            )}

            {/* COMPANY */}
            {tab === 'company' && company && (
              <div className="card-glass max-w-2xl space-y-4 p-6">
                <h3 className="font-semibold text-ink">Company & white-label settings</h3>
                <p className="text-sm text-ink-soft">
                  Used for white-label dispatch and return details on overflow jobs.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Company name" value={company.company_name} onChange={(v) => setCompany({ ...company, company_name: v })} />
                  <TextField label="Contact name" value={company.contact_name} onChange={(v) => setCompany({ ...company, contact_name: v })} />
                </div>
                <TextField label="Return address" value={company.return_address} onChange={(v) => setCompany({ ...company, return_address: v })} />
                <label className="block">
                  <span className="field-label">White-label note (shown to our packers)</span>
                  <textarea
                    className="field min-h-[90px] resize-y"
                    value={company.white_label_note}
                    onChange={(e) => setCompany({ ...company, white_label_note: e.target.value })}
                    placeholder="e.g. No PrintRelay branding. Include the seller's thank-you card."
                  />
                </label>
                <button onClick={handleSaveCompany} className="btn-primary">
                  Save company details
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="card-glass p-4">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="card-glass flex flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/[0.05] text-ink-soft">
        <Inbox size={26} />
      </span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{text}</p>
      <Link to="/estimator" className="btn-primary mt-5">
        <Plus size={16} /> Start an estimate
      </Link>
    </div>
  )
}

function defaultPrefs() {
  return {
    material: 'pla',
    layer_height: 0.2,
    infill: 15,
    printer_profile: 'bambu-a1',
    dispatch_speed: 'standard',
    packaging_type: 'Standard recyclable',
    white_label_default: false,
  }
}

function defaultCompany(user) {
  return {
    company_name: user.company_name || '',
    contact_name: user.full_name || '',
    return_address: '',
    white_label_note: '',
    default_shipping: 'rm-tracked',
  }
}
