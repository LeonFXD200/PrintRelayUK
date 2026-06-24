// ---------------------------------------------------------------------------
// Demo users + saved preferences (mock mode)
// ---------------------------------------------------------------------------
// In Supabase mode these map to the `profiles` and `saved_preferences` tables.
// Passwords are intentionally trivial — this is a public demo, never real auth.

export const demoUsers = [
  {
    id: 'customer-1',
    full_name: 'Alex Carter',
    company_name: '',
    email: 'customer@printrelay.uk',
    password: 'demo',
    role: 'customer',
    business_type: 'Maker / hobbyist',
  },
  {
    id: 'seller-1',
    full_name: 'Priya Shah',
    company_name: 'Maker Lane Studio',
    email: 'seller@printrelay.uk',
    password: 'demo',
    role: 'seller',
    business_type: 'Etsy / TikTok seller',
  },
  {
    id: 'admin-1',
    full_name: 'PrintRelay Ops',
    company_name: 'PrintRelay UK',
    email: 'admin@printrelay.uk',
    password: 'demo',
    role: 'admin',
    business_type: 'Fulfilment',
  },
]

// Default saved print preferences keyed by user id.
export const samplePreferences = {
  'customer-1': {
    material: 'pla',
    layer_height: 0.2,
    infill: 15,
    printer_profile: 'bambu-a1',
    dispatch_speed: 'standard',
    packaging_type: 'Standard recyclable',
    white_label_default: false,
  },
  'seller-1': {
    material: 'petg',
    layer_height: 0.2,
    infill: 20,
    printer_profile: 'bambu-p1s',
    dispatch_speed: 'priority',
    packaging_type: 'Neutral / unbranded',
    white_label_default: true,
  },
}

// Saved company / white-label details for sellers.
export const sampleCompany = {
  'seller-1': {
    company_name: 'Maker Lane Studio',
    contact_name: 'Priya Shah',
    return_address: 'Unit 4, Maker Lane, Manchester M1 2AB',
    white_label_note: 'No PrintRelay branding. Include a thank-you card if provided.',
    default_shipping: 'evri-tracked',
  },
}
