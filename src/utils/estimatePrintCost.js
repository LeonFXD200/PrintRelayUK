// ===========================================================================
// PrintRelay UK — print cost & time estimator
// ===========================================================================
// This is a deliberately readable, transparent estimate engine. It is NOT a
// slicer: it approximates material usage, print time and price so customers
// can get an instant ballpark before we review the actual file.
//
// All tunable business constants live at the top so pricing is easy to adjust.
// Every value returned is rounded for display by the caller (see format.js).

import { getMaterial } from '../data/materials.js'
import { getPrinter } from '../data/printers.js'
import { getDispatch, getShipping } from '../data/options.js'

// --- Tunable business constants --------------------------------------------
export const PRICING = {
  // Portion of a model's *solid* volume that becomes plastic before infill is
  // considered — accounts for perimeters/walls + solid top & bottom layers.
  shellAllowance: 0.25,
  // Non-printing overhead multiplier (travel moves, retractions, etc.).
  printOverhead: 1.3,
  // One-off machine setup/handling time added per job (hours).
  setupHours: 0.15,
  // Flat labour/setup fee per job (£).
  setupFeeGBP: 4.5,
  // Base packaging fee (£) and the extra charged for neutral/white-label packs.
  packagingBaseGBP: 1.5,
  whiteLabelExtraGBP: 1.5,
  // Baseline chance a print needs re-running; scaled by material difficulty
  // and printer reliability below.
  baseFailureRisk: 0.05,
  // Extra urgency added on top of the dispatch speed when "urgent" is ticked.
  urgentToggleExtra: 0.15,
  // Gross margin applied to the production subtotal.
  margin: 0.35,
  // Minimum order value (£) so tiny prints remain viable.
  minimumOrderGBP: 6,
}

// Reference layer height. Finer layers take proportionally longer.
const REFERENCE_LAYER_HEIGHT = 0.2

/**
 * Effective fraction of a solid model that is actually extruded, given infill.
 * e.g. 15% infill -> shell 0.25 + 0.15 * (1 - 0.25) = ~0.36 of solid volume.
 */
export function materialFraction(infillPercent) {
  const infill = clamp(infillPercent, 0, 100) / 100
  return PRICING.shellAllowance + infill * (1 - PRICING.shellAllowance)
}

/**
 * Fallback volume estimate (cm^3) when we cannot parse a mesh (e.g. 3MF/OBJ).
 * Uses file size as a *very* rough proxy and is clearly flagged in the UI.
 */
export function estimateVolumeFromFileSize(bytes) {
  if (!bytes) return 20 // sensible default ~ small trinket
  const mb = bytes / (1024 * 1024)
  // ~14 cm^3 of model per MB, clamped to a believable range.
  return clamp(Math.round(mb * 14), 4, 1200)
}

/** Volume (cm^3) of a solid bounding box, given dimensions in mm. */
export function volumeFromDimensionsMm({ x, y, z }, solidity = 0.35) {
  // Real parts rarely fill their bounding box; apply a solidity factor.
  return ((x * y * z) / 1000) * solidity
}

/**
 * Core estimator.
 *
 * @param {object} opts
 * @param {number} opts.volumeCm3        Solid model volume in cm^3 (per unit)
 * @param {string} opts.materialId
 * @param {string} opts.printerId
 * @param {number} opts.layerHeight      mm
 * @param {number} opts.infill           %
 * @param {number} opts.quantity
 * @param {string} opts.dispatchId
 * @param {string} opts.shippingId
 * @param {boolean} opts.whiteLabel
 * @param {boolean} opts.urgent
 * @returns {object} full, transparent price + time breakdown
 */
export function estimatePrint({
  volumeCm3 = 20,
  materialId,
  printerId,
  layerHeight = REFERENCE_LAYER_HEIGHT,
  infill = 15,
  quantity = 1,
  dispatchId,
  shippingId,
  whiteLabel = false,
  urgent = false,
}) {
  const material = getMaterial(materialId)
  const printer = getPrinter(printerId)
  const dispatch = getDispatch(dispatchId)
  const shipping = getShipping(shippingId)

  const qty = clamp(Math.round(quantity) || 1, 1, 1000)
  const fraction = materialFraction(infill)

  // --- Material usage ------------------------------------------------------
  // Extruded plastic volume per unit (cm^3) -> grams via density.
  const extrudedVolumeCm3 = volumeCm3 * fraction
  const gramsPerUnit = extrudedVolumeCm3 * material.densityGCm3
  const estimatedGrams = round(gramsPerUnit * qty, 0)

  // --- Print time ----------------------------------------------------------
  // Volumetric model: extruded mm^3 / flow rate, slowed by finer layers and
  // padded for non-printing moves, then multiplied by quantity + setup time.
  const extrudedVolumeMm3 = extrudedVolumeCm3 * 1000
  const qualityFactor = REFERENCE_LAYER_HEIGHT / clamp(layerHeight, 0.08, 0.4)
  const printSecondsPerUnit =
    (extrudedVolumeMm3 / printer.flowRateMm3S) * qualityFactor * PRICING.printOverhead
  const estimatedHours = round(
    (printSecondsPerUnit * qty) / 3600 + PRICING.setupHours,
    2,
  )

  // --- Cost components -----------------------------------------------------
  const materialCost = (estimatedGrams / 1000) * material.costPerKgGBP
  const machineCost = estimatedHours * printer.hourlyRateGBP
  const setupCost = PRICING.setupFeeGBP
  const packagingCost =
    PRICING.packagingBaseGBP + (whiteLabel ? PRICING.whiteLabelExtraGBP : 0)
  const shippingCost = shipping.priceGBP

  // Production subtotal — the basis for risk, urgency and margin.
  const subtotal = materialCost + machineCost + setupCost + packagingCost

  // Failure-risk allowance scales with material difficulty and (inverse)
  // printer reliability — riskier combos cost a little more.
  const failureRiskRate = clamp(
    (PRICING.baseFailureRisk * material.difficulty) / printer.reliability,
    0.02,
    0.2,
  )
  const failureRiskCost = subtotal * failureRiskRate

  // Urgency from the chosen dispatch speed + the optional urgent toggle.
  const urgencyRate = dispatch.urgencyMultiplier + (urgent ? PRICING.urgentToggleExtra : 0)
  const urgencyFee = subtotal * urgencyRate

  const marginCost = subtotal * PRICING.margin

  // Total = production + risk + urgency + margin + shipping.
  let total = subtotal + failureRiskCost + urgencyFee + marginCost + shippingCost
  total = Math.max(total, PRICING.minimumOrderGBP + shippingCost)

  return {
    // inputs echoed back for storage / display
    inputs: { material, printer, dispatch, shipping, qty, layerHeight, infill, whiteLabel, urgent },
    estimatedGrams,
    estimatedHours,
    // itemised, transparent breakdown (all £)
    breakdown: {
      materialCost: round(materialCost, 2),
      machineCost: round(machineCost, 2),
      setupCost: round(setupCost, 2),
      packagingCost: round(packagingCost, 2),
      failureRiskCost: round(failureRiskCost, 2),
      urgencyFee: round(urgencyFee, 2),
      margin: round(marginCost, 2),
      shippingCost: round(shippingCost, 2),
    },
    rates: {
      failureRiskRate: round(failureRiskRate * 100, 1),
      urgencyRate: round(urgencyRate * 100, 0),
      marginRate: round(PRICING.margin * 100, 0),
    },
    subtotal: round(subtotal, 2),
    total: round(total, 2),
  }
}

// --- small helpers ----------------------------------------------------------
function clamp(n, min, max) {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

function round(n, dp = 2) {
  const f = 10 ** dp
  return Math.round((n + Number.EPSILON) * f) / f
}
