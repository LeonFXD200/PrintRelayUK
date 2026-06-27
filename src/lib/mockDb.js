// ===========================================================================
// Data layer — mock implementation
// ===========================================================================
// Every function here is async and returns plain data, so each one can later
// be swapped for a Supabase query with the SAME signature. The Supabase
// equivalent is shown in a comment above each function.
//
// In mock mode data is seeded from src/data/* and persisted to localStorage so
// changes (new jobs, status updates, saved preferences) survive a refresh.

import { sampleJobs, sampleEstimates } from '../data/sampleJobs.js'
import { samplePreferences, sampleCompany } from '../data/users.js'
import { sampleEnquiries } from '../data/sampleEnquiries.js'
import { DEFAULT_ENQUIRY_STATUS } from '../data/enquiryStatuses.js'
import { DEMO_PERSIST_MAX_MB } from '../utils/validateQuote.js'
import { isSupabaseConfigured, supabase } from './supabaseClient.js'

const KEYS = {
  jobs: 'pr_jobs',
  estimates: 'pr_estimates',
  prefs: 'pr_prefs',
  company: 'pr_company',
  enquiries: 'pr_enquiries',
}

// Supabase storage bucket for quote-enquiry uploads (created in the SQL migration).
const ENQUIRY_BUCKET = 'enquiry-files'

// --- tiny localStorage helpers ---------------------------------------------
function load(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore corrupt storage */
  }
  localStorage.setItem(key, JSON.stringify(seed))
  return structuredClone(seed)
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

// Simulate a little network latency so loading states are visible in the demo.
const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms))

// Generate a short, readable job id (e.g. PR-1062).
function newJobId() {
  const n = 1000 + Math.floor(performance.now() % 9000)
  return `PR-${n}`
}

// ---------------------------------------------------------------------------
// JOBS
// ---------------------------------------------------------------------------

// Supabase: supabase.from('jobs').select('*').order('created_at',{ascending:false})
//           (optionally .eq('user_id', userId) for a single customer)
export async function listJobs(userId = null) {
  await delay()
  if (isSupabaseConfigured) {
    // return (await supabase.from('jobs').select('*')).data
  }
  const jobs = load(KEYS.jobs, sampleJobs)
  const sorted = [...jobs].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  return userId ? sorted.filter((j) => j.user_id === userId) : sorted
}

// Supabase: supabase.from('jobs').select('*').eq('id', id).single()
export async function getJob(id) {
  await delay(120)
  const jobs = load(KEYS.jobs, sampleJobs)
  return jobs.find((j) => j.id === id) || null
}

// Supabase: supabase.from('jobs').insert(job).select().single()
export async function createJob(job) {
  await delay()
  const jobs = load(KEYS.jobs, sampleJobs)
  const record = {
    id: newJobId(),
    status: 'quote-requested',
    tracking_number: null,
    admin_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...job,
  }
  save(KEYS.jobs, [record, ...jobs])
  return record
}

// Supabase: supabase.from('jobs').update(patch).eq('id', id).select().single()
export async function updateJob(id, patch) {
  await delay(160)
  const jobs = load(KEYS.jobs, sampleJobs)
  const next = jobs.map((j) =>
    j.id === id ? { ...j, ...patch, updated_at: new Date().toISOString() } : j,
  )
  save(KEYS.jobs, next)
  return next.find((j) => j.id === id)
}

// ---------------------------------------------------------------------------
// ESTIMATES (saved drafts)
// ---------------------------------------------------------------------------
export async function listEstimates(userId = null) {
  await delay(200)
  const estimates = load(KEYS.estimates, sampleEstimates)
  return userId ? estimates.filter((e) => e.user_id === userId) : estimates
}

export async function saveEstimate(estimate) {
  await delay()
  const estimates = load(KEYS.estimates, sampleEstimates)
  const record = {
    id: `EST-${Math.floor(performance.now() % 900) + 100}`,
    status: 'draft',
    created_at: new Date().toISOString(),
    ...estimate,
  }
  save(KEYS.estimates, [record, ...estimates])
  return record
}

// ---------------------------------------------------------------------------
// SAVED PREFERENCES
// ---------------------------------------------------------------------------
// Supabase: supabase.from('saved_preferences').select('*').eq('user_id', id).single()
export async function getPreferences(userId) {
  await delay(120)
  const all = load(KEYS.prefs, samplePreferences)
  return all[userId] || null
}

// Supabase: upsert into saved_preferences
export async function savePreferences(userId, prefs) {
  await delay()
  const all = load(KEYS.prefs, samplePreferences)
  all[userId] = { ...all[userId], ...prefs }
  save(KEYS.prefs, all)
  return all[userId]
}

// ---------------------------------------------------------------------------
// COMPANY / WHITE-LABEL DETAILS
// ---------------------------------------------------------------------------
export async function getCompany(userId) {
  await delay(120)
  const all = load(KEYS.company, sampleCompany)
  return all[userId] || null
}

export async function saveCompany(userId, details) {
  await delay()
  const all = load(KEYS.company, sampleCompany)
  all[userId] = { ...all[userId], ...details }
  save(KEYS.company, all)
  return all[userId]
}

// ---------------------------------------------------------------------------
// QUOTE ENQUIRIES (from the /quote form)
// ---------------------------------------------------------------------------
// Lifecycle: new -> contacted -> quoted -> accepted | declined (enquiryStatuses.js).

// Short, readable enquiry id (e.g. ENQ-1042).
function newEnquiryId() {
  const n = 1000 + Math.floor(performance.now() % 9000)
  return `ENQ-${n}`
}

// Read a File into a base64 data URL (browser only). Used in DEMO mode so the
// admin "download" works offline for small files.
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (typeof FileReader === 'undefined') return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

// Supabase: supabase.from('quote_enquiries').select('*').order('created_at',{ascending:false})
export async function listEnquiries() {
  await delay()
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('quote_enquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }
  const all = load(KEYS.enquiries, sampleEnquiries)
  return [...all].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

// Create an enquiry.
// LIVE: goes through the secure `submit-enquiry` Edge Function — the browser
//       NEVER writes to the database or storage directly. The function validates
//       server-side, verifies Turnstile, mints a one-time signed upload URL,
//       inserts the row and sends emails. The file is then uploaded straight to
//       the private bucket via that signed URL (no anon storage access).
export async function createEnquiry({ file = null, turnstileToken = null, ...fields }) {
  await delay()

  // --------------------------- LIVE (Supabase) ---------------------------
  if (isSupabaseConfigured && supabase) {
    const fileMeta = file ? { name: file.name, type: file.type, size: file.size } : null

    const { data, error } = await supabase.functions.invoke('submit-enquiry', {
      body: {
        enquiry: { ...fields, deadline: fields.deadline || null },
        file: fileMeta,
        turnstileToken,
      },
    })
    if (error) throw new Error(error.message || 'Sorry — we could not submit your enquiry.')
    if (!data?.ok) throw new Error('Sorry — we could not submit your enquiry. Please try again.')

    // Upload the file directly to the private bucket using the one-time signed
    // URL the function returned. Non-fatal: the enquiry is already saved.
    if (data.upload && file) {
      const { error: upErr } = await supabase.storage
        .from(ENQUIRY_BUCKET)
        .uploadToSignedUrl(data.upload.path, data.upload.token, file)
      if (upErr) {
        // eslint-disable-next-line no-console
        console.warn('[PrintRelay UK] File upload failed (enquiry saved without file):', upErr.message)
      }
    }

    return { id: data.id, reference: data.reference, status: DEFAULT_ENQUIRY_STATUS, ...fields }
  }

  // ------------------------------- DEMO ----------------------------------
  // Persist metadata; for small files also keep a data URL so the admin
  // download button works offline without a backend.
  let file_data_url = null
  let file_name = ''
  let file_size = 0
  if (file) {
    file_name = file.name
    file_size = file.size
    if (file.size <= DEMO_PERSIST_MAX_MB * 1024 * 1024) {
      file_data_url = await fileToDataUrl(file)
    }
  }

  const record = {
    id: newEnquiryId(),
    status: DEFAULT_ENQUIRY_STATUS,
    admin_notes: '',
    file_url: null,
    file_name,
    file_size,
    file_data_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...fields,
  }

  const all = load(KEYS.enquiries, sampleEnquiries)
  try {
    save(KEYS.enquiries, [record, ...all])
  } catch {
    // localStorage quota hit (large data URL) — retry without the inline file.
    const slim = { ...record, file_data_url: null }
    save(KEYS.enquiries, [slim, ...all])
    return slim
  }
  return record
}

// Supabase: supabase.from('quote_enquiries').update(patch).eq('id', id)...
export async function updateEnquiry(id, patch) {
  await delay(160)
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('quote_enquiries')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = load(KEYS.enquiries, sampleEnquiries)
  const next = all.map((e) =>
    e.id === id ? { ...e, ...patch, updated_at: new Date().toISOString() } : e,
  )
  save(KEYS.enquiries, next)
  return next.find((e) => e.id === id)
}

// Resolve a downloadable URL for an enquiry's file.
// - DEMO: returns the inline data URL if we kept one.
// - LIVE: creates a short-lived signed URL from private storage.
export async function getEnquiryFileUrl(enquiry) {
  if (!enquiry) return null
  if (isSupabaseConfigured && supabase && enquiry.file_url) {
    const { data, error } = await supabase.storage
      .from(ENQUIRY_BUCKET)
      .createSignedUrl(enquiry.file_url, 60 * 10)
    if (error) return null
    return data?.signedUrl || null
  }
  return enquiry.file_data_url || null
}

// Reset the demo back to seed data (handy button on dashboards).
export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
