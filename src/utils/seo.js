// Per-route document title + meta description.
//
// The app is a HashRouter SPA, so the server only ever returns index.html.
// Updating <title> and the meta description on each navigation keeps browser
// tabs, shared links and crawlers that execute JS in sync with the page — a
// cheap, dependency-free win for SEO and UX.

const SUFFIX = 'PrintRelay UK'

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
    title: `File Responsibility & Terms | ${SUFFIX}`,
    description:
      'How PrintRelay UK handles your files: used only to quote, print and fulfil your order — never reused, resold or shared.',
  },
  '/contact': {
    title: `Contact PrintRelay UK | 3D Printing Enquiries`,
    description:
      'Get in touch about a 3D printing job, overflow capacity or a white-label partnership.',
  },
  '/login': { title: `Sign In | ${SUFFIX}`, description: 'Sign in to track your 3D printing jobs and saved estimates.' },
  '/register': { title: `Create an Account | ${SUFFIX}`, description: 'Create a PrintRelay UK account to track jobs and reorder.' },
  '/dashboard': { title: `Your Dashboard | ${SUFFIX}`, description: 'Track jobs, saved estimates and print preferences.' },
  '/admin': { title: `Operations | ${SUFFIX}`, description: 'Print queue and operations dashboard.' },
}

const FALLBACK = {
  title: `Page Not Found | ${SUFFIX}`,
  description: 'The page you were looking for could not be found.',
}

/** Update document.title and the meta description for the given pathname. */
export function applyRouteMeta(pathname) {
  const meta = PAGE_META[pathname] || (pathname === '/' ? PAGE_META['/'] : FALLBACK)
  document.title = meta.title

  let tag = document.querySelector('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', meta.description)
}
