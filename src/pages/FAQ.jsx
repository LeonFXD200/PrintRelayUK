import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const FAQ_GROUPS = [
  {
    heading: 'Files & Models',
    faqs: [
      {
        q: 'What file types do you accept?',
        a: 'We accept STL, 3MF and OBJ files. STL is the most widely used format for FDM printing and receives a live 3D preview and an instant volume-based estimate in our tool. 3MF and OBJ files are also fully supported and receive an automatic estimate on upload, confirmed after a brief file review before printing begins.',
      },
      {
        q: 'Can I change the size or scale of my model?',
        a: 'Yes. The estimator includes a scale control that lets you resize your model before placing an order. Adjusting the scale automatically updates the volume, estimated weight, print time and price. If you need a precise final size in millimetres, you can enter the target dimensions and the tool will calculate the correct scale factor.',
      },
      {
        q: 'How accurate is the instant price estimate?',
        a: "The instant estimate is a transparent, volume-based approximation designed to let you budget before committing. It uses your model's volume, the selected material and a simplified print-time model. Real geometry, support structures and optimal print orientation can affect actual material use and time, so final pricing is confirmed after file review. We will always notify you before proceeding if the confirmed price differs meaningfully from the estimate.",
      },
    ],
  },
  {
    heading: 'Materials & Colours',
    faqs: [
      {
        q: 'What materials do you offer?',
        a: 'We currently offer PLA, PLA+, PETG, ABS, ASA and TPU. PLA and PLA+ suit the majority of everyday models and decorative prints. PETG adds durability and moisture resistance for functional parts. ABS and ASA handle higher temperatures and outdoor environments. TPU is our flexible option for prints that need to bend or compress. See the Materials page for a full breakdown of strengths, finishes and recommended uses.',
      },
      {
        q: 'What colours are available?',
        a: 'We stock a practical range of colours across each material, including black, white, grey, red, blue, green and others. Availability varies by material and is shown when you configure your order. If you need a specific colour that is not listed, get in touch and we will let you know what we can source.',
      },
    ],
  },
  {
    heading: 'Pricing & Orders',
    faqs: [
      {
        q: 'Do you work with personal customers, businesses and bulk orders?',
        a: 'Yes — we work with all three. Whether you need a single model printed for personal use, regular overflow capacity as a 3D print seller or farm, or a larger batch run for a product launch, we can accommodate it. Bulk and repeat orders can be discussed directly via our contact page.',
      },
      {
        q: 'Is the instant estimate the final price I will pay?',
        a: "The instant estimate is a fast, indicative price based on your model's volume and the options you select. Final pricing is confirmed after we review your file, as support structures, infill settings and print orientation can all affect actual material use and print time. We will contact you if the confirmed price differs from the estimate before your order proceeds.",
      },
      {
        q: 'Can I reorder the same job?',
        a: 'Yes. Previous jobs in your dashboard include a one-click reorder option, so you can repeat a product without re-uploading the file or reconfiguring your settings each time.',
      },
    ],
  },
  {
    heading: 'Dispatch & Delivery',
    faqs: [
      {
        q: 'How long does it take to print and dispatch my order?',
        a: 'Print time depends on the size, complexity and material of your model. We offer standard, priority and express dispatch tiers, with estimated turnaround windows shown at checkout based on our current queue. We work to keep dispatch on schedule but do not guarantee specific production windows, as print times can vary with model complexity.',
      },
      {
        q: 'How is my order delivered?',
        a: 'Orders are dispatched via tracked UK courier services. Estimated delivery windows depend on the dispatch tier you select at checkout. We currently fulfil UK orders only and do not offer international shipping at this time.',
      },
      {
        q: 'Can you ship directly to my customer?',
        a: "Yes. The estimator includes a customer-direct dispatch option. When selected, we post the finished prints straight to your buyer's address. Combined with white-label packaging, your customer receives their order with no PrintRelay branding anywhere on the parcel.",
      },
      {
        q: 'Will PrintRelay branding appear on the parcel?',
        a: 'No. When white-label dispatch is selected, parcels are sent in plain, unbranded packaging. There is no PrintRelay marking on the box, shipping label or any paperwork inside. Your brand stays front and centre.',
      },
    ],
  },
  {
    heading: 'Copyright & File Handling',
    faqs: [
      {
        q: 'Can you print copyrighted or licensed models?',
        a: 'Only if you own the design, hold a valid licence, or have explicit written permission from the rights holder. By uploading a file you confirm you have the right to have it reproduced. We may decline files that appear to contain unlicensed intellectual property, trademarked characters, weapon-related designs or other unsuitable content. Please see our File Responsibility page for full details.',
      },
      {
        q: 'Is my uploaded file kept private?',
        a: 'Yes. Uploaded files are used solely to quote, print and fulfil your specific order. They are never reused, resold, shared with third parties, or printed for anyone other than the customer who submitted the order.',
      },
    ],
  },
  {
    heading: 'After Your Order',
    faqs: [
      {
        q: 'What if there is an issue with my print?',
        a: 'If you believe there is a quality issue with your order, contact us with your order or quote reference number, the file name, a clear description of the problem and photos where possible. We review every quality complaint promptly and will arrange a reprint for defects that are clearly on our side.',
      },
      {
        q: 'Do you offer refunds on custom prints?',
        a: "Because every print is made to order from the file you supply, we are unable to offer refunds for prints that match the specification you submitted. If a print fails due to a quality defect on our side — such as poor layer adhesion or a structural failure unrelated to the model design — we will reprint it at no additional charge. We do not offer refunds where a print accurately reproduces a file that has design limitations such as thin walls, unsupported overhangs or a scale that makes the model inherently fragile.",
      },
    ],
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
          className={`shrink-0 text-brand-600 transition-transform ${open ? 'rotate-180' : ''}`}
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

export default function FAQ() {
  const [open, setOpen] = useState(null)

  function toggle(q) {
    setOpen((prev) => (prev === q ? null : q))
  }

  return (
    <div>
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything sellers, makers and personal customers usually ask before their first order."
      />

      <div className="section py-12 space-y-10">
        {FAQ_GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft">
                {group.heading}
              </h2>
              <div className="h-px flex-1 bg-ink/10" />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {group.faqs.map((faq) => (
                <Item key={faq.q} faq={faq} open={open === faq.q} onToggle={() => toggle(faq.q)} />
              ))}
            </div>
          </div>
        ))}
      </div>

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
