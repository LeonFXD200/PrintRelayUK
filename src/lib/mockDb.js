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
import { isSupabaseConfigured } from './supabaseClient.js'

const KEYS = {
  jobs: 'pr_jobs',
  estimates: 'pr_estimates',
  prefs: 'pr_prefs',
  company: 'pr_company',
}

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

// Reset the demo back to seed data (handy button on dashboards).
export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
