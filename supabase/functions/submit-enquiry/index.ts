// ===========================================================================
// Supabase Edge Function: submit-enquiry
// ---------------------------------------------------------------------------
// The ONLY way the public writes a quote enquiry. The browser never touches the
// database or storage directly. This function:
//   1. Validates the form server-side (never trust the client).
//   2. Verifies Cloudflare Turnstile and FAILS CLOSED in production (see
//      REQUIRE_TURNSTILE below) BEFORE storing anything.
//   3. Mints a short-lived signed UPLOAD url for the file (private bucket).
//   4. Inserts the enquiry row using the service-role key (bypasses RLS).
//   5. Sends notification + acknowledgement emails via Resend (when configured).
//
// Env vars Supabase injects automatically: SUPABASE_URL, plus the admin key as
// SUPABASE_SECRET_KEYS (new API-key system) or SUPABASE_SERVICE_ROLE_KEY (legacy).
// OPTIONAL secrets you set yourself:
//   TURNSTILE_SECRET_KEY, RESEND_API_KEY, ENQUIRY_FROM_EMAIL, ENQUIRY_NOTIFY_EMAIL
//   REQUIRE_TURNSTILE   defaults to "true" (fail closed). Set to "false" ONLY if
//                       you deliberately run live mode without Turnstile.
//
// ⚠️  DO NOT enable live mode unless Turnstile is configured: with the default
//     REQUIRE_TURNSTILE=true and no TURNSTILE_SECRET_KEY, every submission is
//     rejected (fail closed) on purpose, before anything is stored.
//
// Deploy:  supabase functions deploy submit-enquiry
// (config.toml sets verify_jwt = false so the anon public form can call it.)
// ===========================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { adminEnquiryEmail, customerEnquiryEmail, type Enquiry } from './templates.ts'

// Resolve the server-only admin key. Supabase's new API-key system exposes
// secret keys to Edge Functions as SUPABASE_SECRET_KEYS — a JSON object keyed by
// name, with the default at ['default']. Fall back to the legacy
// SUPABASE_SERVICE_ROLE_KEY only if needed. The key value is never logged.
function resolveAdminKey(): string {
  const raw = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (raw) {
    try {
      const keys = JSON.parse(raw)
      if (keys && typeof keys.default === 'string' && keys.default) return keys.default
    } catch {
      // Malformed JSON — fall through to the legacy key without logging anything.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = resolveAdminKey()
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('ENQUIRY_FROM_EMAIL') ?? 'PrintRelay UK <onboarding@resend.dev>'
const NOTIFY_EMAIL = Deno.env.get('ENQUIRY_NOTIFY_EMAIL') ?? ''

// Bot protection FAILS CLOSED by default: unset (or anything other than the
// literal "false") means Turnstile is REQUIRED. Set REQUIRE_TURNSTILE=false to
// deliberately run without it (not recommended for a public form).
const REQUIRE_TURNSTILE = (Deno.env.get('REQUIRE_TURNSTILE') ?? 'true').toLowerCase() !== 'false'

const BUCKET = 'enquiry-files'
const ACCEPTED_EXT = ['.stl', '.3mf', '.obj', '.step', '.stp', '.zip']
const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50 MB — keep in sync with the SQL bucket limit

// CORS: reflect ONLY known-good origins (production domain + local dev), never
// "*". This is a browser-enforced control that COMPLEMENTS Turnstile but is NOT
// the main anti-spam defence — a non-browser client (curl, a bot) can ignore
// CORS entirely, which is exactly why server-side Turnstile + validation exist.
const ALLOWED_ORIGINS = [
  'https://printrelay.co.uk',
  'https://www.printrelay.co.uk',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
  // Echo the origin back only when it's allow-listed; otherwise omit the header
  // so the browser blocks the cross-origin response.
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

const str = (v: unknown) => String(v ?? '').trim()
const clamp = (v: unknown, max: number) => str(v).slice(0, max)
const ext = (name: string) => (name.toLowerCase().match(/\.[a-z0-9]+$/) || [''])[0]

// ---- server-side validation (mirrors src/utils/validateQuote.js) ----------
function validate(enquiry: Record<string, unknown>, file: { name?: string; size?: number } | null) {
  const errors: Record<string, string> = {}
  if (!str(enquiry.name)) errors.name = 'Name is required.'
  const email = str(enquiry.email)
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email.'
  const phone = str(enquiry.phone)
  if (!phone) errors.phone = 'Phone is required.'
  else {
    const digits = phone.replace(/\D/g, '')
    if (!/^[+\d\s()-]+$/.test(phone) || digits.length < 7 || digits.length > 15)
      errors.phone = 'Invalid phone.'
  }
  if (!str(enquiry.what_printed)) errors.what_printed = 'Description is required.'
  const qty = Number(enquiry.quantity)
  if (!Number.isFinite(qty) || qty < 1 || qty > 100000) errors.quantity = 'Invalid quantity.'
  if (!str(enquiry.material)) errors.material = 'Material is required.'
  if (enquiry.consent !== true) errors.consent = 'Consent is required.'
  if (file && file.name) {
    if (!ACCEPTED_EXT.includes(ext(file.name))) errors.file = 'Unsupported file type.'
    else if ((file.size || 0) > MAX_FILE_BYTES) errors.file = 'File too large.'
  }
  return errors
}

// ---- Cloudflare Turnstile — FAILS CLOSED when REQUIRE_TURNSTILE is on -------
// Returns { ok:false, configError:true } when verification is required but no
// secret is configured (a server misconfiguration), so the caller can answer
// 503 rather than implying the visitor did something wrong.
async function verifyTurnstile(token: string, ip: string) {
  if (!TURNSTILE_SECRET) {
    if (REQUIRE_TURNSTILE) {
      return { ok: false, configError: true, error: 'turnstile-required-but-not-configured' }
    }
    return { ok: true, skipped: true }
  }
  if (!token) return { ok: false, error: 'missing-token' }
  const form = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token })
  if (ip) form.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })
  const data = await res.json()
  return { ok: Boolean(data.success), error: (data['error-codes'] || []).join(',') }
}

// ---- Resend (skipped unless RESEND_API_KEY is set) -------------------------
async function sendEmails(record: Enquiry) {
  if (!RESEND_API_KEY) return { emailed: false }
  const send = (payload: Record<string, unknown>) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

  const tasks: Promise<unknown>[] = []
  if (NOTIFY_EMAIL) {
    tasks.push(
      send({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        reply_to: record.email,
        subject: `New quote enquiry ${record.reference ?? ''} — ${record.name ?? ''}`.trim(),
        html: adminEnquiryEmail(record),
      }),
    )
  }
  tasks.push(
    send({
      from: FROM_EMAIL,
      to: record.email,
      subject: 'We’ve received your quote enquiry — PrintRelay UK',
      html: customerEnquiryEmail(record),
    }),
  )
  await Promise.allSettled(tasks)
  return { emailed: true }
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req)
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return reply({ error: 'Server not configured' }, 500)

  let payload: {
    enquiry?: Record<string, unknown>
    file?: { name: string; type?: string; size?: number } | null
    turnstileToken?: string
  }
  try {
    payload = await req.json()
  } catch {
    return reply({ error: 'Invalid JSON' }, 400)
  }

  const enquiry = payload.enquiry || {}
  const file = payload.file || null

  // 1. Validate server-side.
  const errors = validate(enquiry, file)
  if (Object.keys(errors).length) return reply({ error: 'validation', errors }, 422)

  // 2. Verify Turnstile BEFORE storing anything (fails closed in production).
  const ip = req.headers.get('CF-Connecting-IP') || req.headers.get('x-forwarded-for') || ''
  const verify = await verifyTurnstile(str(payload.turnstileToken), ip)
  if (!verify.ok) {
    return verify.configError
      ? reply({ error: 'server-misconfigured', detail: verify.error }, 503)
      : reply({ error: 'turnstile-failed', detail: verify.error }, 400)
  }

  // Privileged DB/storage client. Pass the resolved server secret key as the
  // second createClient argument ONLY — the SDK sends it as the apikey, which is
  // how new sb_secret_... keys must be presented. Do NOT set a manual
  // Authorization: Bearer header (that's for JWTs and breaks new secret keys with
  // "Invalid JWT"), and do NOT inherit or forward the incoming browser
  // Authorization/apikey/cookies/headers. Auth is server-safe (no persisted /
  // refreshed session, no URL session detection). RLS is unchanged.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  // 3. If a file is attached, mint a short-lived signed UPLOAD url (private bucket).
  let upload: { path: string; token: string } | null = null
  let file_url: string | null = null
  let file_name = ''
  let file_size = 0
  if (file && file.name) {
    const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 120)
    const path = `${crypto.randomUUID()}_${safe}`
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
    if (error) return reply({ error: 'storage', detail: error.message }, 500)
    upload = { path: data.path, token: data.token }
    file_url = data.path
    file_name = file.name
    file_size = Number(file.size) || 0
  }

  // 4. Insert the enquiry (service role bypasses RLS).
  const { data: record, error: insErr } = await admin
    .from('quote_enquiries')
    .insert({
      name: clamp(enquiry.name, 120),
      email: clamp(enquiry.email, 200),
      phone: clamp(enquiry.phone, 40),
      business_name: clamp(enquiry.business_name, 160),
      what_printed: clamp(enquiry.what_printed, 4000),
      quantity: Math.trunc(Number(enquiry.quantity) || 1),
      material: clamp(enquiry.material, 60),
      colour: clamp(enquiry.colour, 60),
      dimensions: clamp(enquiry.dimensions, 200),
      deadline: str(enquiry.deadline) || null,
      budget: clamp(enquiry.budget, 120),
      notes: clamp(enquiry.notes, 8000),
      consent: enquiry.consent === true,
      source: clamp(enquiry.source, 40) || 'quote-form',
      file_name,
      file_size,
      file_url,
      status: 'new',
    })
    .select('id, reference, name, email, phone, business_name, what_printed, quantity, material, colour, dimensions, deadline, budget, notes, file_name, source')
    .single()

  if (insErr) return reply({ error: 'insert', detail: insErr.message }, 500)

  // 5. Best-effort emails (never block the response on email failure).
  const emailResult = await sendEmails(record as Enquiry).catch(() => ({ emailed: false }))

  return reply({
    ok: true,
    id: record.id,
    reference: record.reference,
    upload, // { path, token } | null — client uploads the file to this signed url
    emailed: emailResult.emailed,
  })
})
                                                           