// ---------------------------------------------------------------------------
// Printer profiles
// ---------------------------------------------------------------------------
// Each profile feeds the print-time and cost estimator. Values are realistic
// ballpark figures for an MVP estimate — NOT a substitute for a real slicer.
//
//  buildVolume        mm (x,y,z)
//  avgPrintSpeedMmS   typical effective print speed (mm/s)
//  flowRateMm3S       typical volumetric flow rate (mm^3/s) used to estimate time
//  hourlyRateGBP      machine running cost charged per print hour (£)
//  reliability        0–1 multiplier; lower = more failure-risk allowance
//  enclosed           true = enclosed chamber (better for ABS/ASA)
//  materials          materials this profile handles well (matches materials.js ids)

export const printers = [
  {
    id: 'bambu-a1',
    name: 'Bambu Lab A1',
    buildVolume: { x: 256, y: 256, z: 256 },
    avgPrintSpeedMmS: 200,
    flowRateMm3S: 18,
    hourlyRateGBP: 1.8,
    reliability: 0.96,
    enclosed: false,
    materials: ['pla', 'pla-plus', 'petg', 'tpu'],
    blurb: 'Fast, reliable open-frame workhorse, our default for PLA and PETG.',
  },
  {
    id: 'bambu-p1s',
    name: 'Bambu Lab P1S',
    buildVolume: { x: 256, y: 256, z: 256 },
    avgPrintSpeedMmS: 220,
    flowRateMm3S: 20,
    hourlyRateGBP: 2.1,
    reliability: 0.95,
    enclosed: true,
    materials: ['pla', 'pla-plus', 'petg', 'abs', 'asa', 'tpu'],
    blurb: 'Enclosed CoreXY, ideal for ABS/ASA and engineering parts.',
  },
  {
    id: 'prusa-mk4s',
    name: 'Prusa MK4S',
    buildVolume: { x: 250, y: 210, z: 220 },
    avgPrintSpeedMmS: 170,
    flowRateMm3S: 16,
    hourlyRateGBP: 2.0,
    reliability: 0.97,
    enclosed: false,
    materials: ['pla', 'pla-plus', 'petg', 'asa', 'tpu'],
    blurb: 'Famously dependable, with great surface finish and consistency.',
  },
  {
    id: 'creality-k1c',
    name: 'Creality K1C',
    buildVolume: { x: 220, y: 220, z: 250 },
    avgPrintSpeedMmS: 240,
    flowRateMm3S: 19,
    hourlyRateGBP: 1.7,
    reliability: 0.92,
    enclosed: true,
    materials: ['pla', 'pla-plus', 'petg', 'abs', 'asa', 'tpu'],
    blurb: 'High-speed enclosed printer with a hardened nozzle.',
  },
  {
    id: 'generic-fdm',
    name: 'Generic mid-range FDM',
    buildVolume: { x: 220, y: 220, z: 250 },
    avgPrintSpeedMmS: 120,
    flowRateMm3S: 12,
    hourlyRateGBP: 1.5,
    reliability: 0.9,
    enclosed: false,
    materials: ['pla', 'pla-plus', 'petg'],
    blurb: 'Conservative profile for general-purpose jobs.',
  },
]

// Default selected printer — the Bambu Lab A1 is a popular modern FDM machine.
export const DEFAULT_PRINTER_ID = 'bambu-a1'

export const getPrinter = (id) =>
  printers.find((p) => p.id === id) || printers.find((p) => p.id === DEFAULT_PRINTER_ID)
