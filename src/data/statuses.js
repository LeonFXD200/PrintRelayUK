// ---------------------------------------------------------------------------
// Job statuses
// ---------------------------------------------------------------------------
// `order` drives the timeline progress. `tone` maps to a StatusBadge colour.
// Terminal/branch statuses (issue, cancelled) have order = null so they don't
// appear as a normal step on the linear timeline.

export const STATUSES = [
  { id: 'draft', label: 'Draft estimate', order: 0, tone: 'slate' },
  { id: 'quote-requested', label: 'Quote requested', order: 1, tone: 'brand' },
  { id: 'awaiting-payment', label: 'Awaiting payment', order: 2, tone: 'amber' },
  { id: 'file-review', label: 'File review', order: 3, tone: 'brand' },
  { id: 'printing', label: 'Printing', order: 4, tone: 'brand' },
  { id: 'quality-check', label: 'Quality check', order: 5, tone: 'brand' },
  { id: 'packed', label: 'Packed', order: 6, tone: 'brand' },
  { id: 'dispatched', label: 'Dispatched', order: 7, tone: 'emerald' },
  { id: 'complete', label: 'Complete', order: 8, tone: 'emerald' },
  { id: 'issue', label: 'Issue found', order: null, tone: 'red' },
  { id: 'cancelled', label: 'Cancelled', order: null, tone: 'slate' },
]

// Ordered steps used to render the linear job timeline.
export const TIMELINE_STEPS = STATUSES.filter((s) => s.order !== null).sort(
  (a, b) => a.order - b.order,
)

export const getStatus = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0]

// Convenience list for <select> menus in the admin dashboard.
export const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s.id, label: s.label }))
