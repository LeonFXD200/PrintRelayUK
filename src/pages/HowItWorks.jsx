import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UploadCloud,
  Calculator,
  ClipboardCheck,
  CreditCard,
  ScanLine,
  Printer,
  PackageCheck,
  Truck,
  ArrowRight,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const CUSTOMER_STEPS = [
  { icon: UploadCloud, title: 'Upload your model', text: 'Drop in your STL, 3MF or OBJ file. STL files get a live 3D preview.' },
  { icon: Calculator, title: 'Get an instant estimate', text: 'We estimate material weight, print time and a transparent price breakdown.' },
  { icon: ClipboardCheck, title: 'Confirm your options', text: 'Pick material, colour, quality, quantity and dispatch speed, then request your quote.' },
  { icon: CreditCard, title: 'File review and payment', text: 'We sanity-check the file and confirm the final price before any payment.' },
  { icon: Printer, title: 'We print your job', text: 'Your job joins the queue and is printed on a profiled, well-maintained machine.' },
  { icon: ScanLine, title: 'Quality check', text: 'Each part is inspected before it leaves us. Issues are flagged early.' },
  { icon: PackageCheck, title: 'Packed', text: 'Securely packed, in neutral white-label packaging if you asked for it.' },
  { icon: Truck, title: 'Dispatched', text: 'Shipped to you or direct to your customer, with a tracking number added.' },
]

const SELLER_STEPS = [
  'Upload your model',
  'Choose seller / white-label options',
  'Get an instant estimate',
  'Confirm the order',
  'PrintRelay prints and packs',
  'Order shipped direct to your customer',
  'You receive the tracking number',
]

/**
 * "How it works" — step-by-step walkthrough of the customer and seller journeys.
 */
export default function HowItWorks() {
  return (
    <div>
      <PageHeader
        eyebrow="How it works"
        title="From uploaded file to dispatched parcel"
        subtitle="A clear, predictable process. You see the price before you commit, and you can track every stage."
      />

      {/* Customer journey */}
      <section className="section py-12">
        <h2 className="text-xl font-semibold text-ink">The standard journey</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CUSTOMER_STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="card relative p-5"
            >
              <span className="absolute right-4 top-4 font-display text-3xl font-semibold text-ink/[0.06]">
                {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
                <s.icon size={22} />
              </span>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Seller workflow */}
      <section className="section py-8">
        <div className="rounded-3xl bg-ink p-8 text-paper-light sm:p-10">
          <span className="chip bg-brand-500/20 text-brand-200">Seller / white-label workflow</span>
          <h2 className="mt-4 text-2xl font-semibold text-paper-light">
            Overflow fulfilment in seven steps
          </h2>
          <ol className="mt-6 space-y-3">
            {SELLER_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-paper/85">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/sellers" className="btn-accent">
              More for sellers <ArrowRight size={16} />
            </Link>
            <Link to="/estimator" className="btn-light">
              Try the estimator
            </Link>
          </div>
        </div>
      </section>

      {/* Accuracy note */}
      <section className="section py-12">
        <div className="card p-6">
          <h3 className="font-semibold text-ink">A note on estimates</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Our instant estimate is a fast approximation based on your model&apos;s volume, the
            chosen material and printer profile, and a simplified print-time model. It is{' '}
            <strong className="text-ink">not a replacement for slicing software</strong>. Geometry,
            supports, fine detail and orientation all affect the real figures, so we confirm the
            final price after a quick file review.
          </p>
        </div>
      </section>
    </div>
  )
}
