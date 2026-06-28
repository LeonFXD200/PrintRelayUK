import { describe, it, expect } from 'vitest'
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_OPTIONS,
  getEnquiryStatus,
  DEFAULT_ENQUIRY_STATUS,
} from './enquiryStatuses.js'

describe('enquiry statuses (admin fulfilment lifecycle)', () => {
  it('includes the migration-0004 fulfilment statuses', () => {
    const ids = ENQUIRY_STATUSES.map((s) => s.id)
    expect(ids).toEqual(
      expect.arrayContaining(['awaiting_approval', 'printing', 'posted', 'complete']),
    )
  })

  it('maps a status slug to its label', () => {
    expect(getEnquiryStatus('printing').label).toBe('Printing')
    expect(getEnquiryStatus('awaiting_approval').label).toBe('Awaiting approval')
  })

  it('falls back to the default status for unknown slugs', () => {
    expect(getEnquiryStatus('nope').id).toBe(DEFAULT_ENQUIRY_STATUS)
  })

  it('exposes one <select> option per status', () => {
    expect(ENQUIRY_STATUS_OPTIONS).toHaveLength(ENQUIRY_STATUSES.length)
    expect(ENQUIRY_STATUS_OPTIONS.every((o) => o.value && o.label)).toBe(true)
  })

  it('only uses tones supported by StatusBadge', () => {
    const valid = new Set(['slate', 'brand', 'amber', 'emerald', 'red'])
    expect(ENQUIRY_STATUSES.every((s) => valid.has(s.tone))).toBe(true)
  })
})
