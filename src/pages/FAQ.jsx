import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const FAQS = [
  {
    q: 'Can I upload STL files?',
    a: 'Yes. STL is fully supported and gets a live 3D preview plus a real volume-based estimate. We also accept 3MF and OBJ, which are estimated from the file and confirmed after a quick review.',
  },
  {
    q: 'Can you ship directly to my customer?',
    a: 'Yes. Turn on "Ship direct to customer" in the estimator. We post straight to your buyer, so you never have to handle the parcel.',
  },
  {
    q: 'Will your branding be on the parcel?',
    a: 'No. With white-label packaging selected, there is no PrintRelay branding on the parcel, paperwork or insert. It is neutral and unbranded.',
  },
  {
    q: 'Do you reuse uploaded files?',
    a: 'Never. Files are used solely to quote, print and fulfil your specific order. They are not reused, resold, shared or printed for anyone else.',
  },
  {
    q: 'How accurate is the estimate?',
    a: 'It is a fast, transparent approximation based on model volume, material and a simplified print-time model, not a full slice. Geometry, supports and orientation affect the real figures, so we confirm the final price after file review.',
  },
  {
    q: 'What materials do you offer?',
    a: 'PLA, PLA+, PETG, ABS, ASA and TPU. That range covers the vast majority of seller and maker jobs. See the Materials page for strengths and use cases.',
  },
  {
    q: 'Can you print copyrighted models?',
    a: 'Only if you own the design or have permission. We may reject files that appear copyrighted, branded without permission, weapon-related, explicit or otherwise unsuitable. See our File Responsibility page.',
  },
  {
    q: 'What happens if the print fails?',
    a: 'A small failure-risk allowance is built into every quote. If a print fails on our side, we re-print it, so you are not charged again for our mistakes.',
  },
  {
    q: 'Can I reorder the same job?',
    a: 'Yes. Previous jobs in your dashboard have a one-click Reorder button, ideal for repeat products.',
  },
  {
    q: 'Is this for businesses only?',
    a: 'No. We serve both sellers and print farms needing overflow capacity, and everyday customers who just want a single model printed.',
  },
  {
    q: 'Do you offer sanding or painting?',
    a: 'For now we focus on print-only fulfilment so we can keep quality and turnaround consistent. Finishing may be available later or by special request, so get in touch.',
  },
  {
    q: 'Can I use this if my printer breaks?',
    a: 'Absolutely, that is a core use case. Send us the overflow while you repair your machine and keep your orders shipping on time.',
  },
  {
    q: 'Can I use this for Etsy orders?',
    a: 'Yes. White-label packaging and customer-direct dispatch are designed exactly for Etsy, eBay and TikTok sellers.',
  },
]

function Item({ faq, open, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="font-sans font-semibold text-ink">{faq.q}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-clay-600 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * FAQ page — an accordion of common customer and seller questions.
 */
export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <div>
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything sellers and makers usually ask before sending us their first job."
      />
      <section className="section grid gap-3 py-12 lg:grid-cols-2">
        {FAQS.map((faq, i) => (
          <Item key={faq.q} faq={faq} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </section>
      <section className="section pb-14">
        <div className="card p-8 text-center">
          <h3 className="text-xl font-semibold text-ink">Still have a question?</h3>
          <p className="mt-1 text-ink-soft">We&apos;re happy to help before you commit to a job.</p>
          <Link to="/contact" className="btn-primary mt-5 inline-flex">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  )
}
