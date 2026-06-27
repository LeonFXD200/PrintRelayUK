import { Link } from 'react-router-dom'
import { Mail, MapPin, ShieldCheck, Send } from 'lucide-react'

const COLS = [
  {
    title: 'Service',
    links: [
      { to: '/estimator', label: 'Instant estimate' },
      { to: '/quote', label: 'Request a quote' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/materials', label: 'Materials' },
    ],
  },
  {
    title: 'For sellers',
    links: [
      { to: '/sellers', label: 'White-label fulfilment' },
      { to: '/dashboard', label: 'Seller dashboard' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms', label: 'Terms of service' },
      { to: '/terms', label: 'File responsibility' },
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/faq', label: 'Copyright policy' },
    ],
  },
]

/**
 * Site footer: brand blurb, contact details and grouped navigation columns.
 */
export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-paper-light">
      <div className="section grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand + contact */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-light font-display text-lg font-bold text-ink">
              P
            </span>
            <span className="font-display text-xl font-semibold text-paper-light">
              PrintRelay <span className="text-brand-300">UK</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            UK 3D print fulfilment for sellers, makers and businesses. Upload, estimate, print and
            dispatch, without the bottleneck.
          </p>
          <div className="mt-5 space-y-2 text-sm text-paper/70">
            <p className="flex items-center gap-2">
              <Mail size={15} className="text-brand-300" />
              {/* Plain selectable text (no mailto) so no email app is ever forced open. */}
              <span className="select-all">printrelayuk@gmail.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Send size={15} className="text-brand-300" />
              <Link to="/quote" className="transition-colors hover:text-brand-300">
                Request a quote online
              </Link>
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-300" /> Sevenoaks, Kent, United Kingdom
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-brand-300" /> Confidential file handling
            </p>
          </div>
        </div>

        {/* Link columns */}
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-paper/80">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l, i) => (
                <li key={`${l.to}-${i}`}>
                  <Link
                    to={l.to}
                    className="text-sm text-paper/60 transition hover:text-brand-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-paper/10">
        <div className="section flex flex-col items-center justify-between gap-3 py-5 text-xs text-paper/50 sm:flex-row">
          <p>© 2026 PrintRelay UK. A portfolio MVP demonstration project.</p>
          <p>Estimates are indicative. Final pricing confirmed after file review.</p>
        </div>
      </div>
    </footer>
  )
}
