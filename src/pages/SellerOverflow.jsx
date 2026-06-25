import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PackageOpen,
  Send,
  EyeOff,
  Layers3,
  Zap,
  Wrench,
  Clock,
  Repeat,
  Settings2,
  Hash,
  ArrowRight,
  Store,
} from 'lucide-react'

const BENEFITS = [
  { icon: PackageOpen, title: 'Neutral packaging', text: 'Plain, unbranded packaging that protects your brand experience.' },
  { icon: Send, title: 'Customer-direct dispatch', text: 'We post straight to your buyer, so you never touch the parcel.' },
  { icon: EyeOff, title: 'No PrintRelay branding', text: 'Nothing of ours on the parcel, invoice or insert.' },
  { icon: Layers3, title: 'Batch order support', text: 'Send a whole batch of repeat products in one go.' },
  { icon: Zap, title: 'Emergency overflow capacity', text: 'Hit a sales spike? Offload the overflow instantly.' },
  { icon: Wrench, title: 'Printer breakdown support', text: 'Machine down mid-order? We keep you shipping.' },
  { icon: Clock, title: '24 to 72 hour dispatch', text: 'Standard, priority and express options per job.' },
  { icon: Repeat, title: 'Reorder repeat products', text: 'One click to re-run a product you sell regularly.' },
  { icon: Settings2, title: 'Saved seller preferences', text: 'Default material, quality, packaging and dispatch saved.' },
  { icon: Hash, title: 'Tracking in your dashboard', text: 'Tracking numbers land in your dashboard automatically.' },
]

const WORKFLOW = [
  'Upload your model',
  'Choose seller / white-label options',
  'Get an instant estimate',
  'Confirm the order',
  'PrintRelay prints and packs (neutral)',
  'Order shipped direct to your customer',
  'You receive the tracking number',
]

/**
 * "For sellers" page. Pitches the white-label / overflow fulfilment offering:
 * neutral packaging, customer-direct dispatch, and batch + repeat-order support.
 */
export default function SellerOverflow() {
  return (
    <div>
      {/* Hero (dark ink block) */}
      <section className="relative overflow-hidden bg-ink text-paper-light">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="section relative py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="chip bg-brand-500/20 text-brand-200">
              <Store size={14} /> For 3D print sellers and farms
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-paper-light sm:text-5xl">
              Your backup print farm, <span className="text-brand-300">without your customers knowing.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-paper/70">
              Etsy, eBay or TikTok orders piling up? Printer down at the worst possible time?
              PrintRelay UK is the overflow capacity behind your shop. We print, pack in neutral
              packaging and ship direct to your customer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-accent px-6 py-3 text-base">
                Join as a seller <ArrowRight size={18} />
              </Link>
              <Link to="/estimator" className="btn-light px-6 py-3 text-base">
                Estimate an overflow job
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="section py-14">
        <h2 className="text-2xl font-semibold text-ink">Built for sellers under pressure</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
              className="card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon size={20} />
              </span>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{b.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="section py-8">
        <div className="rounded-3xl border border-ink/10 bg-paper-light p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-ink">The seller workflow</h2>
          <p className="mt-2 text-ink-soft">Hands-off fulfilment that protects your brand.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, i) => (
              <div key={step} className="relative card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium text-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="section py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: 'Sales spike', text: 'A TikTok goes viral and you suddenly have 80 orders. Send the overflow and keep shipping on time.' },
            { title: 'Printer breakdown', text: 'Your main machine throws a fault mid-batch. We cover the queue while you repair.' },
            { title: 'Repeat products', text: 'You sell the same product weekly. Save it, reorder in one click, batch dispatch.' },
          ].map((u) => (
            <div key={u.title} className="card p-6">
              <h3 className="font-sans text-base font-semibold text-ink">{u.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{u.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-ink p-8 text-center text-paper-light sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-semibold text-paper-light">Ready to add overflow capacity?</h3>
            <p className="mt-1 text-paper/70">Create a seller account and save your defaults in minutes.</p>
          </div>
          <Link to="/register" className="btn-accent shrink-0 px-6 py-3">
            Join as a seller <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
