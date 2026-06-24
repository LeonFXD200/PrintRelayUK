// Maps filament colour names to display hex values (swatches + 3D preview).
export const COLOUR_HEX = {
  Black: '#1f2937',
  White: '#f8fafc',
  Grey: '#9ca3af',
  Red: '#ef4444',
  Blue: '#3b82f6',
  Orange: '#f97316',
  Green: '#22c55e',
  Natural: '#e7d8b8',
  Clear: '#cbd5e1',
  'Matte Black': '#111827',
}

export const colourToHex = (name) => COLOUR_HEX[name] || '#4d95ff'
