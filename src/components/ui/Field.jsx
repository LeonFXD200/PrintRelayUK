// Reusable, theme-consistent form controls (warm editorial / light theme).
import { Check } from 'lucide-react'
import { COLOUR_HEX } from '../../utils/colours.js'

export function Select({ label, value, onChange, options, hint }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <select
        className="field appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6357' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

export function NumberField({ label, value, onChange, min = 1, max = 1000, step = 1, suffix }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <div className="relative">
        <input
          type="number"
          className="field"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

export function TextField({ label, value, onChange, placeholder, type = 'text', error }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <input
        type={type}
        className={`field ${error ? 'border-red-400 focus:ring-red-500/20' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

/** On/off pill toggle. */
export function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
        checked ? 'border-pine-500/50 bg-pine-50' : 'border-ink/15 bg-white hover:border-ink/30'
      }`}
      aria-pressed={checked}
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-soft">{description}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-pine-500' : 'bg-ink/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

/** Segmented radio-style selector for a small set of options. */
export function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-xl border p-3 text-left transition ${
                active
                  ? 'border-pine-500/60 bg-pine-50 ring-1 ring-pine-500/30'
                  : 'border-ink/15 bg-white hover:border-ink/30'
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{o.label}</span>
                {active && <Check size={15} className="text-pine-600" />}
              </span>
              {o.sublabel && <span className="mt-0.5 block text-xs text-ink-soft">{o.sublabel}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Colour swatch picker. */
export function ColourPicker({ label, value, onChange, colours }) {
  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {colours.map((c) => {
          const active = c === value
          return (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => onChange(c)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-pine-500 bg-pine-50 text-ink'
                  : 'border-ink/15 bg-white text-ink-light hover:border-ink/30'
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-black/15"
                style={{ background: COLOUR_HEX[c] || '#94a3b8' }}
              />
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
