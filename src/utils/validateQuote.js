// ===========================================================================
// Quote-form validation (pure, framework-free)
// ===========================================================================
// Kept deliberately free of React / DOM so it can be unit-tested in isolation
// (see validateQuote.test.js) and reused by both the form and, later, any
// server-side check. Every function takes plain values and returns plain data.

// Accepted upload formats for a quote enquiry. STL is the primary format; we
// also accept the other common mesh/solid exports and zipped bundles.
export const ACCEPTED_FILE_EXTENSIONS = ['.stl', '.3mf', '.obj', '.step', '.stp', '.zip']

// Hard cap on a single upload (applies in live/Supabase mode). STL meshes can
// be large, so this is generous; tune alongside the storage bucket limit.
export const MAX_FILE_MB = 50

// In demo mode the file is persisted to localStorage as a data URL ONLY when it
// is below this size, so the admin "download" button is testable offline
// without blowing the storage quota. Larger files keep metadata only.
export const DEMO_PERSIST_MAX_MB = 1

// Pragmatic email check — not RFC-perfect on purpose (those reject valid
// addresses). Requires something@something.tld with no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone: allow digits, spaces, +, -, (), and require at least 7 digits so we
// accept UK and international formats without being fussy.
export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim())
}

export function isValidPhone(value) {
  const v = String(value || '').trim()
  if (!v) return false
  // Only phone-ish characters allowed (digits, spaces, +, -, parentheses)…
  if (!/^[+\d\s()-]+$/.test(v)) return false
  // …and a sensible number of actual digits (UK or international).
  const digits = v.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

export function fileExtension(name) {
  const m = String(name || '').toLowerCase().match(/\.[a-z0-9]+$/)
  return m ? m[0] : ''
}

export function isAcceptedFile(name) {
  return ACCEPTED_FILE_EXTENSIONS.includes(fileExtension(name))
}

/**
 * Validate the quote form values.
 * @param {object} v - form values (see QuoteForm state)
 * @param {object} [opts]
 * @param {boolean} [opts.turnstileRequired] - whether a Turnstile token must be present
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
export function validateQuote(v = {}, opts = {}) {
  const errors = {}
  const trimmed = (s) => String(s ?? '').trim()

  // --- required text fields ---
  if (!trimmed(v.name)) errors.name = 'Please enter your name.'
  else if (trimmed(v.name).length > 100) errors.name = 'Name is too long.'

  if (!trimmed(v.email)) errors.email = 'Please enter your email address.'
  else if (!isValidEmail(v.email)) errors.email = 'Enter a valid email address, e.g. name@example.com.'

  if (!trimmed(v.phone)) errors.phone = 'Please enter a phone number.'
  else if (!isValidPhone(v.phone)) errors.phone = 'Enter a valid phone number (UK or international).'

  if (!trimmed(v.what_printed)) errors.what_printed = 'Tell us what you need printed.'
  else if (trimmed(v.what_printed).length < 3) errors.what_printed = 'Please add a little more detail.'

  // --- quantity ---
  const qty = Number(v.quantity)
  if (!v.quantity && v.quantity !== 0) errors.quantity = 'Enter a quantity.'
  else if (!Number.isFinite(qty) || qty < 1) errors.quantity = 'Quantity must be at least 1.'
  else if (qty > 100000) errors.quantity = 'That quantity looks too high — please contact us directly.'

  // --- material (id from materials.js or the "not-sure" sentinel) ---
  if (!trimmed(v.material)) errors.material = 'Choose a material (or “Not sure”).'

  // --- optional: deadline must be a real date if provided ---
  if (trimmed(v.deadline)) {
    const d = new Date(v.deadline)
    if (Number.isNaN(d.getTime())) errors.deadline = 'Enter a valid date.'
  }

  // --- optional: file must be an accepted type / size if provided ---
  if (v.file) {
    if (!isAcceptedFile(v.file.name)) {
      errors.file = `Unsupported file. Accepted: ${ACCEPTED_FILE_EXTENSIONS.join(', ')}.`
    } else if (v.file.size > MAX_FILE_MB * 1024 * 1024) {
      errors.file = `File is too large (max ${MAX_FILE_MB} MB).`
    }
  }

  // --- consent (required) ---
  if (!v.consent) errors.consent = 'Please tick the box so we can reply to your enquiry.'

  // --- bot protection (only enforced when Turnstile is configured) ---
  if (opts.turnstileRequired && !trimmed(v.turnstileToken)) {
    errors.turnstile = 'Please complete the verification challenge.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
