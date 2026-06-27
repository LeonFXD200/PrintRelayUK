// ===========================================================================
// HTML email templates for quote enquiries (used by the submit-enquiry function).
// Plain inline-styled HTML so it renders well across email clients.
// ===========================================================================

// Minimal HTML escaping so user input can't break the markup.
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface Enquiry {
  id?: string
  reference?: string
  name?: string
  email?: string
  phone?: string
  business_name?: string
  what_printed?: string
  quantity?: number | string
  material?: string
  colour?: string
  dimensions?: string
  file_name?: string
  deadline?: string
  budget?: string
  notes?: string
  source?: string
}

const BRAND = '#1f72e0'
const INK = '#14233f'
const SOFT = '#6b7789'

function ref(e: Enquiry): string {
  return esc(e.reference || e.id || 'enquiry')
}

function row(label: string, value?: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:${SOFT};font-size:13px;white-space:nowrap;vertical-align:top">${esc(
      label,
    )}</td>
    <td style="padding:6px 0;color:${INK};font-size:13px">${esc(value)}</td>
  </tr>`
}

function shell(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#ffffff;border:1px solid #e6ebf4;border-radius:16px;overflow:hidden">
        <div style="background:${INK};padding:18px 24px">
          <span style="color:#ffffff;font-size:18px;font-weight:600">PrintRelay <span style="color:#79b2f8">UK</span></span>
        </div>
        <div style="padding:24px">
          <h1 style="margin:0 0 12px;font-size:18px;color:${INK}">${esc(title)}</h1>
          ${inner}
        </div>
      </div>
      <p style="text-align:center;color:${SOFT};font-size:11px;margin:16px 0 0">PrintRelay UK · Sevenoaks, Kent · United Kingdom</p>
    </div>
  </body></html>`
}

/** Internal notification to the business inbox. */
export function adminEnquiryEmail(e: Enquiry): string {
  const inner = `
    <p style="margin:0 0 16px;color:${SOFT};font-size:14px">New quote enquiry <strong style="color:${INK}">${ref(
      e,
    )}</strong>${e.source ? ` · via ${esc(e.source)}` : ''}.</p>
    <table style="width:100%;border-collapse:collapse">
      ${row('Name', e.name)}
      ${row('Email', e.email)}
      ${row('Phone', e.phone)}
      ${row('Business', e.business_name)}
      ${row('Needs printed', e.what_printed)}
      ${row('Quantity', e.quantity)}
      ${row('Material', e.material)}
      ${row('Colour', e.colour)}
      ${row('Dimensions', e.dimensions)}
      ${row('File', e.file_name)}
      ${row('Deadline', e.deadline)}
      ${row('Budget', e.budget)}
      ${row('Notes', e.notes)}
    </table>
    <p style="margin:16px 0 0;color:${SOFT};font-size:12px">Reply directly to this email to reach the customer.</p>
  `
  return shell('New quote enquiry', inner)
}

/** Auto-reply acknowledgement to the customer. */
export function customerEnquiryEmail(e: Enquiry): string {
  const inner = `
    <p style="margin:0 0 12px;color:${INK};font-size:14px">Hi ${esc(
      (e.name || '').split(' ')[0] || 'there',
    )},</p>
    <p style="margin:0 0 12px;color:${SOFT};font-size:14px">Thanks for your enquiry — we’ve received it and will reply with a price and lead time, usually within <strong style="color:${INK}">1–2 working days</strong> (Mon–Fri).</p>
    <p style="margin:0 0 16px;color:${SOFT};font-size:14px">Your reference is <strong style="color:${BRAND}">${ref(
      e,
    )}</strong>.</p>
    <div style="background:#f4f6fb;border-radius:12px;padding:12px 16px">
      <table style="width:100%;border-collapse:collapse">
        ${row('Needs printed', e.what_printed)}
        ${row('Quantity', e.quantity)}
        ${row('Material', e.material)}
        ${row('Colour', e.colour)}
        ${row('Deadline', e.deadline)}
      </table>
    </div>
    <p style="margin:16px 0 0;color:${SOFT};font-size:12px">If anything’s changed, just reply to this email.</p>
  `
  return shell('We’ve received your enquiry', inner)
}
