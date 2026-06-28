// ---------------------------------------------------------------------------
// Quote-enquiry statuses
// ---------------------------------------------------------------------------
// These are the lifecycle states for a *quote enquiry* submitted via the
// /quote form. They are deliberately separate from the print-job STATUSES in
// statuses.js (which track a paid job from file review to dispatch).
//
// `tone` maps to a colour in StatusBadge.jsx (slate | brand | amber | emerald | red).

export const ENQUIRY_STATUSES = [
  { id: 'new', label: 'New', tone: 'brand', hint: 'Just received — not yet actioned.' },
  { id: 'contacted', label: 'Contacted', tone: 'amber', hint: 'We have replied / reached out.' },
  { id: 'quoted', label: 'Quoted', tone: 'slate', hint: 'A price has been sent to the customer.' },
  // Admin fulfilment lifecycle (slugs match migration 0004's CHECK constraint).
  { id: 'awaiting_approval', label: 'Awaiting approval', tone: 'amber', hint: 'Quote sent; awaiting customer approval.' },
  { id: 'accepted', label: 'Accepted', tone: 'emerald', hint: 'Customer accepted the quote.' },
  { id: 'printing', label: 'Printing', tone: 'brand', hint: 'In production.' },
  { id: 'posted', label: 'Posted', tone: 'slate', hint: 'Dispatched to the customer.' },
  { id: 'complete', label: 'Complete', tone: 'emerald', hint: 'Order complete.' },
  { id: 'declined', label: 'Declined', tone: 'red', hint: 'Closed / not proceeding.' },
]

export const DEFAULT_ENQUIRY_STATUS = 'new'

export const getEnquiryStatus = (id) =>
  ENQUIRY_STATUSES.find((s) => s.id === id) || ENQUIRY_STATUSES[0]

// Convenience list for <select> menus in the admin dashboard.
export const ENQUIRY_STATUS_OPTIONS = ENQUIRY_STATUSES.map((s) => ({
  value: s.id,
  label: s.label,
}))
