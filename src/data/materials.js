// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
// densityGCm3      g/cm^3 — used to convert printed volume -> grams
// costPerKgGBP     spool cost per kilogram (£) — drives material cost
// difficulty       multiplier applied to failure-risk / handling (1 = easy)
// requiresEnclosure true if it really wants an enclosed chamber
// outdoor          'good' | 'ok' | 'poor' UV / weather suitability
// colours          available colour options for the picker

export const materials = [
  {
    id: 'pla',
    name: 'PLA',
    densityGCm3: 1.24,
    costPerKgGBP: 19,
    difficulty: 1.0,
    requiresEnclosure: false,
    outdoor: 'poor',
    use: 'Models, prototypes, display pieces, board-game inserts.',
    strength: 'Rigid and easy to print, but brittle and softens in heat/cars.',
    colours: ['Black', 'White', 'Grey', 'Red', 'Blue', 'Orange', 'Green', 'Natural'],
  },
  {
    id: 'pla-plus',
    name: 'PLA+',
    densityGCm3: 1.26,
    costPerKgGBP: 23,
    difficulty: 1.05,
    requiresEnclosure: false,
    outdoor: 'poor',
    use: 'Tougher display + light-duty functional parts.',
    strength: 'Improved toughness and layer adhesion vs standard PLA.',
    colours: ['Black', 'White', 'Grey', 'Red', 'Blue', 'Matte Black'],
  },
  {
    id: 'petg',
    name: 'PETG',
    densityGCm3: 1.27,
    costPerKgGBP: 24,
    difficulty: 1.15,
    requiresEnclosure: false,
    outdoor: 'ok',
    use: 'Functional parts, brackets, outdoor-ish items, cosplay.',
    strength: 'Tough, slightly flexible, good chemical + moisture resistance.',
    colours: ['Black', 'White', 'Grey', 'Clear', 'Blue', 'Orange', 'Green'],
  },
  {
    id: 'abs',
    name: 'ABS',
    densityGCm3: 1.04,
    costPerKgGBP: 22,
    difficulty: 1.35,
    requiresEnclosure: true,
    outdoor: 'ok',
    use: 'Heat-resistant enclosures, automotive-style parts.',
    strength: 'Strong + heat resistant; warps without an enclosure.',
    colours: ['Black', 'White', 'Grey', 'Red'],
  },
  {
    id: 'asa',
    name: 'ASA',
    densityGCm3: 1.07,
    costPerKgGBP: 27,
    difficulty: 1.4,
    requiresEnclosure: true,
    outdoor: 'good',
    use: 'Outdoor parts, signage, UV-exposed components.',
    strength: 'Like ABS but UV-stable, great for outdoor use.',
    colours: ['Black', 'White', 'Grey', 'Natural'],
  },
  {
    id: 'tpu',
    name: 'TPU (flexible)',
    densityGCm3: 1.21,
    costPerKgGBP: 32,
    difficulty: 1.45,
    requiresEnclosure: false,
    outdoor: 'ok',
    use: 'Phone grips, gaskets, straps, shock-absorbing parts.',
    strength: 'Rubber-like and flexible; prints slowly and needs care.',
    colours: ['Black', 'White', 'Red', 'Blue', 'Clear'],
  },
]

export const DEFAULT_MATERIAL_ID = 'pla'

export const getMaterial = (id) =>
  materials.find((m) => m.id === id) || materials.find((m) => m.id === DEFAULT_MATERIAL_ID)
