import { describe, it, expect, beforeEach } from 'vitest'
import { createEnquiry, listEnquiries, updateEnquiry } from './mockDb.js'

// Each test starts from a clean localStorage (re-seeds demo data on first read).
beforeEach(() => globalThis.localStorage.clear())

const payload = {
  name: 'Tom Test',
  email: 'tom@example.com',
  phone: '07700 900000',
  what_printed: 'Replacement gear',
  quantity: 1,
  material: 'petg',
  colour: 'Black',
  consent: true,
  source: 'quote-form',
}

describe('quote enquiries (demo / mock submission)', () => {
  it('creates an enquiry with a reference id and "new" status', async () => {
    const e = await createEnquiry({ ...payload })
    expect(e.id).toMatch(/^ENQ-/)
    expect(e.status).toBe('new')
    expect(e.name).toBe('Tom Test')
    expect(e.consent).toBe(true)
    expect(e.created_at).toBeTruthy()
  })

  it('persists so the new enquiry appears in the list', async () => {
    const created = await createEnquiry({ ...payload })
    const all = await listEnquiries()
    expect(all.some((x) => x.id === created.id)).toBe(true)
  })

  it('updates status and admin notes', async () => {
    const created = await createEnquiry({ ...payload })
    const updated = await updateEnquiry(created.id, {
      status: 'contacted',
      admin_notes: 'Replied with a price.',
    })
    expect(updated.status).toBe('contacted')
    expect(updated.admin_notes).toBe('Replied with a price.')
    expect(updated.updated_at).toBeTruthy()
  })

  it('keeps file metadata when no file is attached', async () => {
    const e = await createEnquiry({ ...payload })
    expect(e.file_name).toBe('')
    expect(e.file_size).toBe(0)
    expect(e.file_url).toBeNull()
  })
})
