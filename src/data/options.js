// ---------------------------------------------------------------------------
// Dispatch speeds, shipping methods, layer heights and infill presets
// ---------------------------------------------------------------------------

// Dispatch speed determines how quickly we START + finish the job.
// urgencyMultiplier is applied to the production subtotal (see estimator).
export const dispatchOptions = [
  {
    id: 'standard',
    name: 'Standard',
    window: '72 hours',
    urgencyMultiplier: 0,
    description: 'Best value. Slots into our normal print queue.',
  },
  {
    id: 'priority',
    name: 'Priority',
    window: '48 hours',
    urgencyMultiplier: 0.18,
    description: 'Jumps ahead of standard jobs.',
  },
  {
    id: 'express',
    name: 'Express',
    window: '24 hours',
    urgencyMultiplier: 0.4,
    description: 'Top of the queue, dedicated machine time.',
  },
]

export const DEFAULT_DISPATCH_ID = 'standard'

// Shipping methods with flat-rate prices for the estimate.
export const shippingMethods = [
  { id: 'rm-tracked', name: 'Royal Mail Tracked 48', priceGBP: 3.95, eta: '2 to 3 working days' },
  { id: 'evri-tracked', name: 'Evri Tracked', priceGBP: 3.45, eta: '2 to 4 working days' },
  { id: 'dpd', name: 'DPD Next Day', priceGBP: 6.95, eta: 'Next working day' },
  { id: 'collection', name: 'Collection / local delivery', priceGBP: 0, eta: 'By arrangement' },
]

export const DEFAULT_SHIPPING_ID = 'rm-tracked'

// Layer height presets (mm). Lower = finer detail but slower.
export const layerHeights = [
  { value: 0.12, label: '0.12 mm · Fine detail' },
  { value: 0.16, label: '0.16 mm · High quality' },
  { value: 0.2, label: '0.20 mm · Standard' },
  { value: 0.28, label: '0.28 mm · Draft / fast' },
]

export const DEFAULT_LAYER_HEIGHT = 0.2

// Infill presets (%). Higher = stronger + heavier + slower.
export const infillPresets = [10, 15, 20, 30, 50, 100]

export const DEFAULT_INFILL = 15

export const getDispatch = (id) =>
  dispatchOptions.find((d) => d.id === id) || dispatchOptions[0]

export const getShipping = (id) =>
  shippingMethods.find((s) => s.id === id) || shippingMethods[0]
