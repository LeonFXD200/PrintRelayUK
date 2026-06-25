import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  PackageOpen,
  Layers,
  Clock,
  ShieldCheck,
  ArrowRight,
  Store,
  User,
  Upload,
  Calculator,
  Printer,
  Truck,
} from 'lucide-react'
import JobStatusPreview from '../components/home/JobStatusPreview.jsx'

// Reusable reveal-on-scroll wrapper.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const TRUST = [
  { icon: MapPin, title: 'UK based', text: 'Printed and dispatched in the UK, with no long overseas waits.' },
  { icon: PackageOpen, title: 'White-label dispatch', text: 'Neutral packaging, shipped direct to your customer.' },
  { icon: Layers, title: 'PLA, PETG, ABS, TPU', text: 'A practical material range for makers and businesses.' },
  { icon: Clock, title: '24 to 72 hour dispatch', text: 'Standard, priority and express options to suit the deadline.' },
  { icon: ShieldCheck, title: 'Secure file handling', text: 'Files are only used to quote, print and fulfil your order.' },
]

const STEPS = [
  { icon: Upload, title: 'Upload', text: 'Drop in your STL, 3MF or OBJ file.' },
  { icon: Calculator, title: 'Estimate', text: 'Instant price, weight and print-time estimate.' },
  { icon: Printer, title: 'We print', text: 'Your job enters our queue, gets printed and checked.' },
  { icon: Truck, title: 'Dispatch', text: 'Packed and shipped, to you or straight to your customer.' },
]

/**
 * Landing page. Marketing hero with the self-animating JobStatusPreview, trust
 * points, a how-it-works summary and dual-audience (seller / maker) CTAs.
 */
export default function Home() {
  return (
    <div>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:46px_46px] opacity-50" />
        <div className="section relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="eyebrow mb-5">UK overflow 3D print fulfilment</span>
            <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              Overflow 3D print fulfilment for when your printers{' '}
              <span className="text-brand-600">can&apos;t keep up.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Upload your model, get an instant estimate, choose material and dispatch speed, then
              let PrintRelay UK handle the print and delivery.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/estimator" className="btn-primary px-6 py-3 text-base">
                Get instant quote <ArrowRight size={18} />
              </Link>
              <Link to="/sellers" className="btn-accent px-6 py-3 text-base">
                Join as a seller
              </Link>
            </div>

            {/* Two customer paths */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <Link
                to="/sellers"
                className="card group flex items-start gap-3 p-4 transition hover:shadow-lift"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                  <Store size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">I&apos;m a 3D print seller</span>
                  <span className="text-sm text-ink-soft">Backup capacity and white-label dispatch</span>
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto mt-1 text-ink-soft transition group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>
              <Link
                to="/estimator"
                className="card group flex items-start gap-3 p-4 transition hover:shadow-lift"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <User size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">I need a model printed</span>
                  <span className="text-sm text-ink-soft">Upload a file and get a price now</span>
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto mt-1 text-ink-soft transition group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>
            </div>
          </motion.div>

          {/* Right: animated preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-full bg-brand-500/10 blur-3xl" />
              <JobStatusPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ========================= TRUST CARDS ========================= */}
      <section className="section py-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TRUST.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                <t.icon size={20} />
              </span>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">{t.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section className="section py-16">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mb-4">Simple by design</span>
          <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
            From file to front door in four steps
          </h2>
          <p className="mt-3 text-ink-soft">
            No quotes by email, no back and forth. See the price before you commit.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative card p-6"
            >
              <span className="absolute right-5 top-4 font-display text-4xl font-semibold text-ink/[0.06]">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-paper-light">
                <s.icon size={22} />
              </span>
              <h3 className="mt-4 font-sans text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{s.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/how-it-works" className="btn-ghost">
            See the full process <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ===================== SELLER OVERFLOW BANNER ===================== */}
      <section className="section py-10">
        <motion.div {...reveal} className="relative overflow-hidden rounded-3xl bg-ink p-8 text-paper-light sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="chip bg-brand-500/20 text-brand-200">For 3D print sellers</span>
              <h2 className="mt-4 text-3xl font-semibold text-paper-light">
                Your backup print farm, without your customers knowing.
              </h2>
              <p className="mt-3 text-paper/70">
                Overloaded with orders? Printer down? Hand the overflow to PrintRelay UK. We print,
                pack in neutral packaging and ship direct to your customer, so your brand stays front
                and centre.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/sellers" className="btn-primary">
                  White-label fulfilment <ArrowRight size={16} />
                </Link>
                <Link to="/pricing" className="btn-light">
                  See pricing
                </Link>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                'Neutral packaging',
                'Customer-direct dispatch',
                'No PrintRelay branding',
                'Batch and repeat orders',
                'Emergency overflow capacity',
                'Printer breakdown cover',
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 rounded-xl bg-paper/10 px-3 py-2.5 text-sm text-paper-light"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="section py-16">
        <motion.div {...reveal} className="card p-10 text-center">
          <h2 className="text-3xl font-semibold text-ink">
            Get an instant estimate in under a minute
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            Upload your STL and we&apos;ll estimate weight, print time and price on the spot. No
            account needed to try it.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/estimator" className="btn-primary px-6 py-3 text-base">
              Get instant quote <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-ghost px-6 py-3 text-base">
              Talk to us
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
