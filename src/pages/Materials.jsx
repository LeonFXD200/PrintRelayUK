import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, CloudSun, CloudRain, Box, Thermometer, ArrowRight, Check, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { materials } from '../data/materials.js'
import { formatGBP } from '../utils/format.js'
import { COLOUR_HEX } from '../utils/colours.js'

// Outdoor suitability -> icon + label
const OUTDOOR = {
  good: { icon: Sun, label: 'Great outdoors (UV-stable)', tone: 'text-emerald-600' },
  ok: { icon: CloudSun, label: 'OK outdoors', tone: 'text-amber-600' },
  poor: { icon: CloudRain, label: 'Indoor use', tone: 'text-ink-soft' },
}

export default function Materials() {
  return (
    <div>
      <PageHeader
        eyebrow="Materials"
        title="A practical material range for real jobs"
        subtitle="We focus on the materials that cover the vast majority of seller and maker work, chosen for reliability rather than novelty."
      />

      <section className="section py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {materials.map((m, i) => {
            const outdoor = OUTDOOR[m.outdoor]
            const OutIcon = outdoor.icon
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
                className="card overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-ink/[0.07] p-5">
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{m.name}</h3>
                    <p className="text-sm text-ink-soft">{m.use}</p>
                  </div>
                  <span className="rounded-xl bg-pine-50 px-3 py-2 text-right">
                    <span className="block text-xs text-ink-soft">from</span>
                    <span className="font-semibold text-pine-700">{formatGBP(m.costPerKgGBP)}/kg</span>
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-ink-soft">{m.strength}</p>

                  {/* spec chips */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="chip bg-ink/[0.05] text-ink-soft">
                      <Box size={13} /> {m.densityGCm3} g/cm³
                    </span>
                    <span className={`chip bg-ink/[0.05] ${outdoor.tone}`}>
                      <OutIcon size={13} /> {outdoor.label}
                    </span>
                    <span className="chip bg-ink/[0.05] text-ink-soft">
                      <Thermometer size={13} /> Difficulty ×{m.difficulty.toFixed(2)}
                    </span>
                    <span
                      className={`chip ${
                        m.requiresEnclosure
                          ? 'bg-clay-50 text-clay-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {m.requiresEnclosure ? <Check size={13} /> : <X size={13} />}
                      {m.requiresEnclosure ? 'Needs enclosure' : 'No enclosure needed'}
                    </span>
                  </div>

                  {/* colours */}
                  <div>
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Colour options
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.colours.map((c) => (
                        <span
                          key={c}
                          title={c}
                          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-2 py-1 text-xs text-ink-soft"
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{ background: COLOUR_HEX[c] || '#94a3b8' }}
                          />
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-10 rounded-3xl bg-ink p-8 text-center text-paper-light">
          <h3 className="text-xl font-semibold text-paper-light">Not sure which to choose?</h3>
          <p className="mx-auto mt-2 max-w-xl text-paper/70">
            Most display pieces and trinkets use PLA. Functional parts usually want PETG, and heat or
            outdoor parts want ABS or ASA. The estimator suggests a suitable printer for each
            material.
          </p>
          <Link to="/estimator" className="btn-accent mt-5 inline-flex">
            Estimate with your material <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
