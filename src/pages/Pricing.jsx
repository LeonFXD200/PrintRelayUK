import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers,
  Clock,
  Wrench,
  Package,
  Truck,
  Zap,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  Check,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { dispatchOptions, shippingMethods } from '../data/options.js'
import { formatGBP } from '../utils/format.js'
import { PRICING } from '../utils/estimatePrintCost.js'

const COMPONENTS = [
  { icon: Layers, title: 'Material cost', text: 'Grams used times spool price per kg. Heavier or denser materials cost more.' },
  { icon: Clock, title: 'Print time', text: 'Estimated machine hours times the printer’s hourly running rate.' },
  { icon: Wrench, title: 'Setup and handling', text: `A flat ${formatGBP(PRICING.setupFeeGBP)} per job covers slicing, plating and machine prep.` },
  { icon: Package, title: 'Packaging', text: `From ${formatGBP(PRICING.packagingBaseGBP)}; neutral white-label adds ${formatGBP(PRICING.whiteLabelExtraGBP)}.` },
  { icon: Truck, title: 'Postage', text: 'Royal Mail, Evri or DPD at cost, or free local collection.' },
  { icon: Zap, title: 'Urgency fee', text: 'Priority and Express jobs cost more. They jump the queue and take machine time from others.' },
  { icon: ShieldAlert, title: 'Failure and quality allowance', text: 'A small allowance covers the real-world risk of re-printing a failed part.' },
  { icon: TrendingUp, title: 'Margin', text: `A ${Math.round(PRICING.margin * 100)}% margin keeps the service sustainable and reliable.` },
]

export default function Pricing() {
  return (
    <div>
      <PageHeader
        eyebrow="Transparent pricing"
        title="You see exactly what makes up the price"
        subtitle="No vague per-gram gimmicks. Every estimate is itemised so you understand what you're paying for, and urgent jobs are priced honestly."
      >
        <Link to="/estimator" className="btn-primary">
          Get your price <ArrowRight size={16} />
        </Link>
      </PageHeader>

      {/* Cost components */}
      <section className="section py-12">
        <h2 className="text-xl font-semibold text-ink">What goes into a quote</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPONENTS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-pine-600">
                <c.icon size={20} />
              </span>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">{c.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dispatch + shipping tables */}
      <section className="section grid gap-6 py-8 lg:grid-cols-2">
        {/* Dispatch */}
        <div className="card overflow-hidden">
          <div className="border-b border-ink/10 p-5">
            <h3 className="font-semibold text-ink">Dispatch speed</h3>
            <p className="text-sm text-ink-soft">How quickly we turn the job around.</p>
          </div>
          <div className="divide-y divide-ink/[0.07]">
            {dispatchOptions.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-ink">{d.name}</p>
                  <p className="text-sm text-ink-soft">{d.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-clay-600">{d.window}</p>
                  <p className="text-xs text-ink-soft">
                    {d.urgencyMultiplier === 0
                      ? 'No surcharge'
                      : `+${Math.round(d.urgencyMultiplier * 100)}% urgency`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="card overflow-hidden">
          <div className="border-b border-ink/10 p-5">
            <h3 className="font-semibold text-ink">Shipping options</h3>
            <p className="text-sm text-ink-soft">Tracked UK delivery, or free local collection.</p>
          </div>
          <div className="divide-y divide-ink/[0.07]">
            {shippingMethods.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-ink">{s.name}</p>
                  <p className="text-sm text-ink-soft">{s.eta}</p>
                </div>
                <p className="font-semibold text-ink">
                  {s.priceGBP === 0 ? 'Free' : formatGBP(s.priceGBP)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty note */}
      <section className="section py-10">
        <div className="rounded-3xl bg-ink p-8 text-paper-light">
          <h3 className="text-xl font-semibold text-paper-light">Realistic, not cheapest</h3>
          <p className="mt-2 max-w-2xl text-paper/70">
            We&apos;re a reliable backup, not a race to the bottom. Quality material, maintained
            machines, a real quality check and a fair failure allowance cost a little more, but they
            mean your orders land right, on time, every time.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              'No hidden fees, every line itemised',
              'Urgent jobs priced transparently',
              'Free re-print if we get it wrong',
              'Volume and repeat-order friendly',
            ].map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-paper-light">
                <Check size={16} className="text-clay-300" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
