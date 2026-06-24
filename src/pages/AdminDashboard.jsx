import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Boxes,
  Zap,
  PoundSterling,
  Clock,
  Layers,
  Gauge,
  Loader2,
  Search,
  RotateCcw,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/admin/StatCard.jsx'
import BarChart from '../components/admin/BarChart.jsx'
import AdminJobRow from '../components/admin/AdminJobRow.jsx'
import { Select, Toggle } from '../components/ui/Field.jsx'
import { listJobs, updateJob, resetDemoData } from '../lib/mockDb.js'
import { STATUSES } from '../data/statuses.js'
import { materials, getMaterial } from '../data/materials.js'
import { formatGBP, formatHours } from '../utils/format.js'

const QUEUE_CAPACITY = 12 // demo "machine slots" for the capacity gauge
const ACTIVE = ['quote-requested', 'awaiting-payment', 'file-review', 'printing', 'quality-check', 'packed']
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Admin / operations dashboard. KPI cards, jobs-by-status and material-demand
 * charts, and a searchable / filterable print queue of editable AdminJobRows.
 * Includes the "reset demo data" action.
 */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [query, setQuery] = useState('')

  async function refresh() {
    setJobs(await listJobs())
    setLoading(false)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function handleUpdate(id, patch) {
    const updated = await updateJob(id, patch)
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)))
  }

  async function handleReset() {
    resetDemoData()
    setLoading(true)
    await refresh()
  }

  // ---- derived metrics ----
  const metrics = useMemo(() => {
    const now = Date.now()
    const billable = jobs.filter((j) => j.status !== 'cancelled')
    const revenue = billable.reduce((s, j) => s + (j.estimated_total || 0), 0)
    const avgHours =
      jobs.length ? jobs.reduce((s, j) => s + (j.estimated_hours || 0), 0) / jobs.length : 0
    const thisWeek = jobs.filter((j) => now - new Date(j.created_at).getTime() < WEEK_MS).length
    const urgent = jobs.filter((j) => j.urgent && ACTIVE.includes(j.status)).length
    const active = jobs.filter((j) => ACTIVE.includes(j.status)).length

    // material demand (total grams per material)
    const gramsByMaterial = {}
    jobs.forEach((j) => {
      gramsByMaterial[j.material] = (gramsByMaterial[j.material] || 0) + (j.estimated_grams || 0)
    })
    const topMaterial = Object.entries(gramsByMaterial).sort((a, b) => b[1] - a[1])[0]

    return { revenue, avgHours, thisWeek, urgent, active, gramsByMaterial, topMaterial }
  }, [jobs])

  // jobs-by-status chart data
  const statusData = useMemo(
    () =>
      STATUSES.map((s) => ({
        label: s.label,
        value: jobs.filter((j) => j.status === s.id).length,
      })).filter((d) => d.value > 0),
    [jobs],
  )

  // material demand chart data
  const materialData = useMemo(
    () =>
      materials
        .map((m) => ({ label: m.name, value: Math.round(metrics.gramsByMaterial[m.id] || 0) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [metrics.gramsByMaterial],
  )

  // filtered queue
  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        if (statusFilter !== 'all' && j.status !== statusFilter) return false
        if (urgentOnly && !j.urgent) return false
        if (query && !`${j.id} ${j.file_name}`.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [jobs, statusFilter, urgentOnly, query],
  )

  const capacityPct = Math.min(100, Math.round((metrics.active / QUEUE_CAPACITY) * 100))

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Operations dashboard"
        subtitle="Every job, estimate and quote request. Manage status, pricing, printers and dispatch."
      >
        <button onClick={handleReset} className="btn-ghost">
          <RotateCcw size={16} /> Reset demo data
        </button>
      </PageHeader>

      <div className="section py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-clay-500" size={32} />
          </div>
        ) : (
          <>
            {/* metric cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={Boxes} label="Jobs this week" value={metrics.thisWeek} sublabel={`${jobs.length} total`} delay={0} />
              <StatCard icon={Zap} label="Urgent in queue" value={metrics.urgent} tone="ember" delay={0.05} />
              <StatCard icon={PoundSterling} label="Est. revenue" value={formatGBP(metrics.revenue)} tone="emerald" delay={0.1} />
              <StatCard icon={Clock} label="Avg print hours" value={formatHours(metrics.avgHours)} delay={0.15} />
              <StatCard
                icon={Layers}
                label="Top material"
                value={metrics.topMaterial ? getMaterial(metrics.topMaterial[0]).name : 'n/a'}
                sublabel={metrics.topMaterial ? `${Math.round(metrics.topMaterial[1])} g` : ''}
                delay={0.2}
              />
              <StatCard icon={Gauge} label="Queue capacity" value={`${capacityPct}%`} sublabel={`${metrics.active}/${QUEUE_CAPACITY} slots`} tone={capacityPct > 80 ? 'ember' : 'brand'} delay={0.25} />
            </div>

            {/* charts */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-glass p-6"
              >
                <h3 className="mb-4 font-semibold text-ink">Jobs by status</h3>
                <BarChart data={statusData} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card-glass p-6"
              >
                <h3 className="mb-4 font-semibold text-ink">Material demand (g)</h3>
                <BarChart data={materialData} unit=" g" accent="ember" />
              </motion.div>
            </div>

            {/* print queue */}
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-ink">Print queue & jobs</h2>
                  <p className="text-sm text-ink-soft">
                    {filtered.length} of {jobs.length} jobs shown
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search id or file…"
                      className="field w-48 pl-9"
                    />
                  </div>
                  <div className="w-44">
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { value: 'all', label: 'All statuses' },
                        ...STATUSES.map((s) => ({ value: s.id, label: s.label })),
                      ]}
                    />
                  </div>
                  <button
                    onClick={() => setUrgentOnly((v) => !v)}
                    className={`btn px-4 py-2.5 text-sm ${
                      urgentOnly ? 'bg-clay-500 text-ink' : 'border border-ink/15 bg-white text-ink'
                    }`}
                  >
                    <Zap size={15} /> Urgent
                  </button>
                </div>
              </div>

              {filtered.length ? (
                <div className="space-y-2">
                  {filtered.map((job) => (
                    <AdminJobRow key={job.id} job={job} onUpdate={handleUpdate} />
                  ))}
                </div>
              ) : (
                <div className="card py-14 text-center text-ink-soft">
                  No jobs match your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
