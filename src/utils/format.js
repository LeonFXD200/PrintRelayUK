// Small formatting helpers used across the UI.

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

/** Format a number as GBP, e.g. 49.7 -> "£49.70". */
export const formatGBP = (n) => gbp.format(Number.isFinite(n) ? n : 0)

/** Human-readable file size, e.g. 4812544 -> "4.6 MB". */
export function formatBytes(bytes) {
  if (!bytes) return 'n/a'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Print hours -> "9h 30m". */
export function formatHours(hours) {
  if (!Number.isFinite(hours)) return 'n/a'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  return `${h}h${m ? ` ${m}m` : ''}`
}

/** ISO date -> "16 Jun 2026". */
export function formatDate(iso) {
  if (!iso) return 'n/a'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Millimetre dimensions object -> "120 × 84 × 36 mm". */
export function formatDims(dims) {
  if (!dims) return 'n/a'
  const r = (n) => Math.round(n)
  return `${r(dims.x)} × ${r(dims.y)} × ${r(dims.z)} mm`
}
