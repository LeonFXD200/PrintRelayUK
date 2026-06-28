import { useEffect, useMemo, useState } from 'react'
import { PoundSterling, Clock, Loader2, Search, Inbox, Zap } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/admin/StatCard.jsx'
import AdminEnquiryRow from '../components/admin/AdminEnquiryRow.jsx'
import { Select } from '../components/ui/Field.jsx'
import { listEnquiries } from '../lib/mockDb.js'
import { ENQUIRY_STATUSES } from '../data/enquiryStatuses.js'

/**
 * Admin dashboard — Phase 2A. A private, READ-ONLY view of real quote enquiries
 * from the database. Access is enforced server-side: AuthContext gates the route
 * on is_admin(), and RLS only returns rows to an allow-listed admin. Each enquiry
 * shows reference, date, customer, print summary, status and quote price, with
 * search + status filtering and a secure short-lived signed-URL file download.
 *
 * No editing in this phase (status updates, quote pricing and notes come later).
 */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [enquiries, setEnquiries] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listEnquiries()
        if (active) setEnquiries(data)
      } catch (e) {
        if (active) setError(e?.message || 'Could not load enquiries.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(
    () =>
      enquiries.filter((e) => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false
        if (
          query &&
          !`${e.reference || ''} ${e.name || ''} ${e.email || ''} ${e.what_printed || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false
        return true
      }),
    [enquiries, statusFilter, query],
  )

  const counts = useMemo(() => {
    const by = (s) => enquiries.filter((e) => e.status === s).length
    return {
      total: enquiries.length,
      new: by('new'),
      quoted: by('quoted'),
      done: enquiries.filter((e) => e.status === 'accepted' || e.status === 'complete').length,
    }
  }, [enquiries])

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Quote enquiries"
        subtitle="Review quote requests submitted through the site. Read-only in this phase."
      />

      <div className="section py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : error ? (
          <div className="card py-14 text-center text-red-600">{error}</div>
        ) : (
          <>
            {/* KPI cards (computed from the real enquiry rows) */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={Inbox} label="Total enquiries" value={counts.total} delay={0} />
              <StatCard
                icon={Zap}
                label="New / unactioned"
                value={counts.new}
                tone={counts.new > 0 ? 'ember' : 'brand'}
                delay={0.05}
              />
              <StatCard icon={Clock} label="Quoted" value={counts.quoted} delay={0.1} />
              <StatCard
                icon={PoundSterling}
                label="Accepted / complete"
                value={counts.done}
                tone="emerald"
                delay={0.15}
              />
            </div>

            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-ink">Enquiries</h2>
                  <p className="text-sm text-ink-soft">
                    {filtered.length} of {enquiries.length} shown
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="relative">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search reference, name, email…"
                      className="field w-60 pl-9"
                      aria-label="Search enquiries"
                    />
                  </div>
                  <div className="w-44">
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { value: 'all', label: 'All statuses' },
                        ...ENQUIRY_STATUSES.map((s) => ({ value: s.id, label: s.label })),
                      ]}
                    />
                  </div>
                </div>
              </div>

              {filtered.length ? (
                <div className="space-y-2">
                  {filtered.map((enquiry) => (
                    <AdminEnquiryRow key={enquiry.id} enquiry={enquiry} readOnly />
                  ))}
                </div>
              ) : (
                <div className="card py-14 text-center text-ink-soft">
                  {enquiries.length
                    ? 'No enquiries match your filters.'
                    : 'No quote enquiries yet. Submissions from the site appear here.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
