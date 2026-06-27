// Per-route document metadata (title, description, canonical, robots, social tags).
//
// IMPORTANT — this app uses HashRouter (client-side routing via the URL
// fragment, e.g. /#/quote). Search engines strip the fragment, so the site is
// effectively a SINGLE indexable URL: the homepage. These per-navigation updates
// therefore keep the browser tab title and social-share previews in sync with
// the active view — they do NOT turn hash routes into separately indexable
// Google pages. (Genuinely per-page-indexable SEO would need clean paths on a
// host that supports SPA rewrites — Cloudflare Pages / Netlify / Vercel — see
// the README "Deploy & routing" section.)

const SUFFIX = 'PrintRelay UK'
const SITE_URL = 'https://printrelay.co.uk'
const HOME_URL = `${SITE_URL}/`

// Private / transactional views that must never be a search result. Marked
// noindex. In a hash SPA they aren't distinct URLs anyway, but this is correct,
// belt-and-braces, and future-proof if the site moves to clean-path hosting.
const NOINDEX_ROUTES = new Set(['/quote', '/admin', '/login', '/register', '/dashboard'])

// Keyed by route pathname (without the leading hash).
const PAGE_META = {
  '/': {
    title: `${SUFFIX} | 3D Printing Service & Instant Online Quote`,
    description:
      'UK-based 3D printing and overflow fulfilment. Upload your models, get an instant online quote, choose PLA, PETG, ABS or TPU, then we print, white-label and dispatch across the UK.',
  },
  '/estimator': {
    title: `Instant 3D Printing Quote — Upload STL, 3MF, OBJ | ${SUFFIX}`,
    description:
      'Upload one or more 3D models for an instant price. Live STL preview, real volume-based estimate, material and dispatch options — no account needed.',
  },
  '/quote': {
    title: `Request a 3D Printing Quote | ${SUFFIX}`,
    description:
      'Tell us what you need printed and get a reviewed, fixed-price quote with lead time — usually within 1–2 working days. Upload your STL or describe the job. No account needed.',
  },
  '/how-it-works': {
    title: `How It Works — From File to Front Door | ${SUFFIX}`,
    description:
      'Upload, estimate, print and dispatch in four simple steps. See how PrintRelay UK turns your 3D model into a delivered part.',
  },
  '/pricing': {
    title: `3D Printing Pricing — Transparent & Itemised | ${SUFFIX}`,
    description:
      'Clear, itemised 3D printing prices: material, machine time, setup, packaging and shipping. See the cost before you commit.',
  },
  '/materials': {
    title: `3D Printing Materials — PLA, PETG, ABS, TPU | ${SUFFIX}`,
    description:
      'A practical FDM material range for makers and businesses: PLA, PETG, ABS and TPU, with guidance on strength, finish and best use.',
  },
  '/sellers': {
    title: `White-Label 3D Print Fulfilment for Sellers | ${SUFFIX}`,
    description:
      'Overflow capacity and white-label dispatch for 3D print sellers and farms. We print, pack in neutral packaging and ship direct to your customer.',
  },
  '/faq': {
    title: `3D Printing FAQ | ${SUFFIX}`,
    description:
      'Answers about file formats, materials, lead times, white-label dispatch, file responsibility and how our instant estimates work.',
  },
  '/terms': {
    title: `Terms of Service & File Responsibility | ${SUFFIX}`,
    description:
      'PrintRelay UK terms of service and how we handle your files: used only to quote, print and fulfil your order — never reused, resold or shared.',
  },
  '/privacy': {
    title: `Privacy Policy | ${SUFFIX}`,
    description:
      'How PrintRelay UK collects, uses and protects your personal information, in line with the UK GDPR and Data Protection Act 2018.',
  },
  '/contact': {
    title: `Contact PrintRelay UK | 3D Printing Enquiries`,
    description:
      'Get in touch about a 3D printing job, overflow capacity or a white-label partnership.',
  },
  '/login': { title: `Sign In | ${SUFFIX}`, description: 'Sign in to track your 3D printing jobs and saved estimates.' },
  '/register': { title: `Create an Account | ${SUFFIX}`, description: 'Create a PrintRelay UK account to track jobs and reorder.' },
  '/dashboard': { title: `Your Dashboard | ${SUFFIX}`, description: 'Track jobs, saved estimates and print preferences.' },
  '/admin': { title: `Operations | ${SUFFIX}`, description: 'Quote enquiries and the print queue.' },
}

const FALLBACK = {
  title: `Page Not Found | ${SUFFIX}`,
  description: 'The page you were looking for could not be found.',
}

// Upsert a <meta> tag identified by `name="…"` or `property="…"`.
function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

// Upsert <link rel="canonical">.
function setCanonical(href) {
  let tag = document.head.querySelector('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'canonical')
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

/**
 * Sync document title, description, robots, canonical and social tags.
 * Canonical / og:url always point at the homepage (the only indexable URL for a
 * hash SPA); private/unknown routes are marked noindex.
 */
export function applyRouteMeta(pathname) {
  const known = PAGE_META[pathname]
  const meta = known || FALLBACK

  document.title = meta.title
  setMeta('name', 'description', meta.description)

  // The fragment is invisible to crawlers, so the canonical document is always
  // the homepage — we do NOT advertise hash URLs as canonical/indexable.
  setCanonical(HOME_URL)
  setMeta('property', 'og:url', HOME_URL)

  // Per-view preview text (UX nicety for tabs / shares — not per-page indexing).
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)

  // Only known public marketing pages are indexable; private/transactional and
  // unknown (404) views are noindex so they can never surface as a result.
  const indexable = Boolean(known) && !NOINDEX_ROUTES.has(pathname)
  setMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, nofollow')
}
