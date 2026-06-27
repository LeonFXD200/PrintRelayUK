import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileBox,
  X,
  Send,
  ShieldCheck,
  Clock,
  ListChecks,
  Lock,
} from 'lucide-react'

import { TextField, Textarea, Select } from '../ui/Field.jsx'
import TurnstileWidget, { turnstileConfigured } from './TurnstileWidget.jsx'
import { materials } from '../../data/materials.js'
import {
  validateQuote,
  ACCEPTED_FILE_EXTENSIONS,
  MAX_FILE_MB,
} from '../../utils/validateQuote.js'
import { createEnquiry } from '../../lib/mockDb.js'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'
import { formatBytes } from '../../utils/format.js'

const COLOUR_OPTIONS = [
  'No preference',
  'Black',
  'White',
  'Grey',
  'Natural',
  'Red',
  'Blue',
  'Green',
  'Orange',
  'Clear',
  'Other (note below)',
]

const MATERIAL_OPTIONS = [
  ...materials.map((m) => ({ value: m.id, label: m.name })),
  { value: 'not-sure', label: 'Not sure / advise me' },
]

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  business_name: '',
  what_printed: '',
  quantity: '1',
  material: '',
  colour: 'No preference',
  dimensions: '',
  deadline: '',
  budget: '',
  notes: '',
  consent: false,
}

// Build the initial form values, merging any estimator hand-off.
function initialValues(prefill) {
  if (!prefill) return { ...EMPTY }
  // Only adopt the handed-over colour if it's one of our options; otherwise keep
  // "No preference" (the exact colour still travels in the prefilled notes).
  const colour = COLOUR_OPTIONS.includes(prefill.colour) ? prefill.colour : 'No preference'
  return {
    ...EMPTY,
    what_printed: prefill.what_printed || '',
    quantity: prefill.quantity != null ? String(prefill.quantity) : '1',
    material: prefill.material || '',
    colour,
    dimensions: prefill.dimensions || '',
    notes: prefill.notes || '',
  }
}

/**
 * The quote enquiry form. Fully self-contained: validation, file upload,
 * loading / success / error states and an optional Turnstile challenge.
 * `prefill` (optional) carries details handed over from the estimator.
 */
export default function QuoteForm({ prefill = null }) {
  const [values, setValues] = useState(() => initialValues(prefill))
  const [file, setFile] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)
  const [attempted, setAttempted] = useState(false)

  const formRef = useRef(null)
  const fileInputRef = useRef(null)

  const set = (key) => (val) => setValues((v) => ({ ...v, [key]: val }))

  // Move focus to the first invalid control after a failed submit (a11y).
  useEffect(() => {
    if (attempted && Object.keys(errors).length) {
      requestAnimationFrame(() => {
        const el = formRef.current?.querySelector('[aria-invalid="true"]')
        el?.focus()
      })
    }
  }, [errors, attempted])

  function onPickFile(e) {
    const f = e.target.files?.[0] || null
    setFile(f)
    setErrors((prev) => ({ ...prev, file: undefined }))
  }

  function clearFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setAttempted(true)
    const candidate = { ...values, file, turnstileToken }
    const { valid, errors: errs } = validateQuote(candidate, {
      turnstileRequired: turnstileConfigured,
    })
    setErrors(errs)
    if (!valid) {
      setStatus('idle')
      return
    }

    setStatus('submitting')
    setSubmitError('')
    try {
      const enquiry = await createEnquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        business_name: values.business_name.trim(),
        what_printed: values.what_printed.trim(),
        quantity: Number(values.quantity),
        material: values.material,
        colour: values.colour,
        dimensions: values.dimensions.trim(),
        deadline: values.deadline || '',
        budget: values.budget.trim(),
        notes: values.notes.trim(),
        consent: Boolean(values.consent),
        source: prefill ? 'estimator' : 'quote-form',
        file,
        turnstileToken,
      })
      setResult(enquiry)
      setStatus('success')
      // Reset the form for a potential next enquiry.
      setValues({ ...EMPTY })
      clearFile()
      setTurnstileToken('')
      setAttempted(false)
      setErrors({})
    } catch (err) {
      setSubmitError(
        err?.message ||
          'Something went wrong sending your enquiry. Please try again, or email us directly.',
      )
      setStatus('error')
    }
  }

  // ---------------------------------------------------------------- success
  if (status === 'success' && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
        role="status"
        aria-live="polite"
      >
        <div className="card p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Enquiry received</h2>
          <p className="mt-2 text-ink-soft">
            Thanks{result.name ? `, ${result.name.split(' ')[0]}` : ''} — your reference is{' '}
            <span className="font-mono font-semibold text-brand-700">
              {result.reference || result.id}
            </span>
            . We aim to reply within <strong>1–2 working days</strong>, Monday to Friday.
          </p>

          {!isSupabaseConfigured && (
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-steel-500/20 bg-steel-50 px-4 py-3 text-xs text-steel-700">
              Demo mode: this enquiry was saved locally in your browser so you can see it in the
              admin dashboard. No email was sent and no data left your device.
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setResult(null)
              }}
              className="btn-primary"
            >
              Submit another enquiry
            </button>
            <Link to="/" className="btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  const submitting = status === 'submitting'
  const errorCount = attempted ? Object.values(errors).filter(Boolean).length : 0

  // ------------------------------------------------------------------- form
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ============ FORM ============ */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="lg:col-span-2">
        <div className="card-glass space-y-7 p-6 sm:p-8">
          {prefill && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-ink-light">
              <span className="font-semibold text-ink">Carried over from your estimate.</span> We’ve
              pre-filled what we can — please add your contact details below.
            </div>
          )}

          {/* error summary (announced) */}
          {errorCount > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Please check the {errorCount} highlighted{' '}
                {errorCount === 1 ? 'field' : 'fields'} below and try again.
              </span>
            </div>
          )}

          {/* ---- Your details ---- */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-ink">Your details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Name"
                required
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={set('name')}
                placeholder="Your full name"
                error={errors.name}
              />
              <TextField
                label="Email"
                required
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={set('email')}
                placeholder="name@example.com"
                error={errors.email}
              />
              <TextField
                label="Phone number"
                required
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={values.phone}
                onChange={set('phone')}
                placeholder="e.g. 07700 900123"
                error={errors.phone}
              />
              <TextField
                label="Business name"
                name="organization"
                autoComplete="organization"
                value={values.business_name}
                onChange={set('business_name')}
                placeholder="Optional"
                hint="Leave blank if this is a personal order."
              />
            </div>
          </fieldset>

          {/* ---- Your project ---- */}
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-ink">Your project</legend>

            <Textarea
              label="What do you need printed?"
              required
              name="what_printed"
              rows={4}
              value={values.what_printed}
              onChange={set('what_printed')}
              placeholder="Describe the part(s), what they’re for, and anything we should know."
              error={errors.what_printed}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Quantity"
                required
                type="number"
                name="quantity"
                inputMode="numeric"
                value={values.quantity}
                onChange={set('quantity')}
                placeholder="1"
                error={errors.quantity}
              />
              <Select
                label="Material"
                required
                name="material"
                value={values.material}
                onChange={set('material')}
                options={MATERIAL_OPTIONS}
                placeholder="Select a material…"
                error={errors.material}
              />
              <Select
                label="Colour preference"
                name="colour"
                value={values.colour}
                onChange={set('colour')}
                options={COLOUR_OPTIONS.map((c) => ({ value: c, label: c }))}
              />
              <TextField
                label="Dimensions"
                name="dimensions"
                value={values.dimensions}
                onChange={set('dimensions')}
                placeholder="e.g. 120 × 80 × 40 mm"
                hint="Approximate size, if known."
              />
            </div>

            {/* File upload */}
            <div>
              <span className="field-label">
                3D file <span className="font-normal normal-case text-ink-soft">(optional)</span>
              </span>
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                    <FileBox size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                    <p className="text-xs text-ink-soft">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded-lg p-2 text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    id="quote-file"
                    type="file"
                    name="file"
                    accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
                    onChange={onPickFile}
                    aria-invalid={errors.file ? 'true' : undefined}
                    aria-describedby={errors.file ? 'quote-file-err' : 'quote-file-hint'}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="quote-file"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-ink/20 bg-paper-light px-4 py-4 transition hover:border-brand-500/50 hover:bg-brand-50/50 peer-focus-visible:border-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <UploadCloud size={18} />
                    </span>
                    <span className="text-sm">
                      <span className="font-medium text-ink">Attach a file</span>
                      <span className="block text-xs text-ink-soft">
                        {ACCEPTED_FILE_EXTENSIONS.join(', ')} · up to {MAX_FILE_MB} MB
                      </span>
                    </span>
                  </label>
                </>
              )}
              {errors.file ? (
                <span id="quote-file-err" role="alert" className="mt-1 block text-xs text-red-600">
                  {errors.file}
                </span>
              ) : (
                <span id="quote-file-hint" className="mt-1 block text-xs text-ink-soft">
                  No file yet? No problem — describe it above and we’ll help.
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Deadline / required by"
                type="date"
                name="deadline"
                value={values.deadline}
                onChange={set('deadline')}
                error={errors.deadline}
                hint="Optional — when do you need it?"
              />
              <TextField
                label="Budget"
                name="budget"
                value={values.budget}
                onChange={set('budget')}
                placeholder="e.g. £50–£100"
                hint="Optional — helps us tailor the quote."
              />
            </div>

            <Textarea
              label="Additional notes"
              name="notes"
              rows={3}
              value={values.notes}
              onChange={set('notes')}
              placeholder="Finish, tolerances, white-label dispatch, anything else…"
            />
          </fieldset>

          {/* Turnstile (only renders when configured) */}
          {turnstileConfigured && (
            <div>
              <TurnstileWidget
                onVerify={(t) => {
                  setTurnstileToken(t)
                  setErrors((prev) => ({ ...prev, turnstile: undefined }))
                }}
                onExpire={() => setTurnstileToken('')}
              />
              {errors.turnstile && (
                <span role="alert" className="mt-1 block text-xs text-red-600">
                  {errors.turnstile}
                </span>
              )}
            </div>
          )}

          {/* Consent */}
          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="consent"
                checked={values.consent}
                onChange={(e) => set('consent')(e.target.checked)}
                aria-invalid={errors.consent ? 'true' : undefined}
                aria-describedby={errors.consent ? 'consent-err' : undefined}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-ink/30 bg-white text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-light">
                I agree to PrintRelay UK using these details to respond to my enquiry, in line with
                the{' '}
                <Link to="/privacy" className="text-brand-600 underline">
                  Privacy Policy
                </Link>
                . <span className="text-red-500" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.consent && (
              <span id="consent-err" role="alert" className="mt-1 block text-xs text-red-600">
                {errors.consent}
              </span>
            )}
          </div>

          {/* Submit + live status */}
          {status === 'error' && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send size={18} /> Send enquiry
                </>
              )}
            </button>
            <p aria-live="polite" className="mt-3 text-center text-xs text-ink-soft">
              We’ll only use your details to reply to this enquiry. No spam, ever.
            </p>
          </div>
        </div>
      </form>

      {/* ============ REASSURANCE SIDEBAR ============ */}
      <aside className="lg:col-span-1">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ListChecks size={17} className="text-brand-600" /> What happens next
            </h3>
            <ol className="mt-3 space-y-3 text-sm text-ink-soft">
              {[
                'We review your enquiry and files.',
                'We confirm a fixed price and lead time.',
                'You approve, we print, check and dispatch.',
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>

          <div className="card space-y-3 p-5 text-sm">
            <p className="flex items-center gap-2 text-ink-soft">
              <Clock size={16} className="shrink-0 text-brand-600" /> Replies within 1–2 working
              days.
            </p>
            <p className="flex items-center gap-2 text-ink-soft">
              <ShieldCheck size={16} className="shrink-0 text-brand-600" /> Files used only to quote
              and fulfil your order.{' '}
              <Link to="/terms" className="text-brand-600 underline">
                Details
              </Link>
            </p>
            <p className="flex items-center gap-2 text-ink-soft">
              <Lock size={16} className="shrink-0 text-brand-600" /> Your data is handled per our{' '}
              <Link to="/privacy" className="text-brand-600 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-5 text-sm text-ink-soft">
            <span className="font-semibold text-ink">Want a price now?</span> Try the{' '}
            <Link to="/estimator" className="text-brand-600 underline">
              instant estimator
            </Link>{' '}
            for STL files, then send it here for a reviewed quote.
          </div>
        </div>
      </aside>
    </div>
  )
}
