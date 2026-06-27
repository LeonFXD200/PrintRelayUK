import { Link } from 'react-router-dom'
import { ShieldCheck, FileLock2, Ban, Check } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const CONTACT_EMAIL = 'printrelayuk@gmail.com'
const UPDATED = '27 June 2026'

const RESPONSIBILITIES = [
  'You must confirm you own the design or have permission to print it.',
  'PrintRelay UK does not claim ownership of your uploaded files.',
  'Uploaded files are only used to quote, print and fulfil the requested order.',
  'Files are not reused, resold, shared or printed for other customers.',
  'You are responsible for ensuring files do not infringe copyright, trademarks or third-party rights.',
]

const REJECTABLE = [
  'Weapon-related or otherwise dangerous items',
  'Explicit or illegal content',
  'Copyrighted or branded designs without permission',
  'Files that appear unsafe or unsuitable for printing',
]

// Plain-English terms of service for a small UK 3D-printing business.
const TERMS = [
  {
    title: '1. About these terms',
    body: (
      <>
        These terms apply to quotes, orders and services provided by PrintRelay UK (“we”, “us”),
        based in Sevenoaks, Kent. By requesting a quote or placing an order you agree to them.
      </>
    ),
  },
  {
    title: '2. Our service',
    body: 'We provide FDM 3D printing and fulfilment services in the UK, including optional white-label dispatch for sellers. We print from files you supply or from a specification we agree with you.',
  },
  {
    title: '3. Quotes and estimates',
    body: 'Any price shown by the online estimator is an indicative estimate only. A binding quote is confirmed after we review your file(s) and requirements, and may differ based on actual geometry, material usage, finishing or special requests.',
  },
  {
    title: '4. Orders and acceptance',
    body: 'A contract is formed only when we confirm your order in writing and (where applicable) payment is received. We may decline an order — for example, if a file falls into the categories below, or cannot be printed safely.',
  },
  {
    title: '5. Pricing and payment',
    body: 'Prices are in pounds sterling (GBP) and, unless stated otherwise, are the total amount payable. Unless agreed otherwise, payment is due before we begin production; we confirm accepted payment methods when we send your quote.',
  },
  {
    title: '6. Lead times and delivery',
    body: 'Dispatch windows (e.g. 24–72 hours) are targets, not guarantees, and start once your order is confirmed. Delivery is by third-party couriers; once an order is handed to the courier or collected, responsibility for the goods passes to you.',
  },
  {
    title: '7. Cancellations and returns',
    body: 'Because printed parts are made to your specification, they are bespoke/personalised goods and are generally exempt from the 14-day right to cancel under the Consumer Contracts Regulations 2013 once production has begun. This does not affect your rights if an item is faulty, not as described or not fit for purpose under the Consumer Rights Act 2015 — contact us and we’ll put it right.',
  },
  {
    title: '8. Intellectual property',
    body: 'You keep all rights in your designs and files. We keep all rights in our website, branding and materials. You grant us a limited licence to use your files only to quote and fulfil your order.',
  },
  {
    title: '9. Liability',
    body: 'To the extent permitted by law, our total liability for any order is limited to the amount you paid for it. Nothing in these terms excludes liability that cannot be excluded by law (such as for death or personal injury caused by negligence).',
  },
  {
    title: '10. Privacy',
    body: (
      <>
        We handle your personal information in line with our{' '}
        <Link to="/privacy" className="text-brand-600 underline">
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
  {
    title: '11. Governing law',
    body: 'These terms are governed by the laws of England and Wales, and disputes are subject to the courts of England and Wales.',
  },
]

/**
 * Terms of service + file-responsibility page. Plain-English terms for a small
 * UK 3D-printing business, plus the ownership rules and confidential handling.
 */
export default function Terms() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Terms of service and file responsibility"
        subtitle="Plain-English terms for working with us, how we treat your files, and what you’re responsible for when you upload."
      />

      <section className="section grid gap-6 py-12 lg:grid-cols-2">
        {/* Your responsibilities */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
              <ShieldCheck size={20} />
            </span>
            <h2 className="text-lg font-semibold text-ink">Your responsibilities</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {RESPONSIBILITIES.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* What we may reject */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Ban size={20} />
            </span>
            <h2 className="text-lg font-semibold text-ink">Files we may reject</h2>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            PrintRelay UK may decline to print files that appear:
          </p>
          <ul className="mt-3 space-y-3">
            {REJECTABLE.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <Ban size={16} className="mt-0.5 shrink-0 text-brand-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Confidential handling */}
      <section className="section pb-8">
        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel-50 text-steel-600">
            <FileLock2 size={20} />
          </span>
          <div>
            <h3 className="font-semibold text-ink">Confidential file handling</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              We treat every upload as confidential. Files are accessed only by the team fulfilling
              your order and are never shared externally or used to print for anyone else. For this
              MVP we offer a confidential-handling commitment rather than a formal NDA. If your work
              needs a signed agreement, get in touch and we&apos;ll arrange one.
            </p>
          </div>
        </div>
      </section>

      {/* Terms of service */}
      <section className="section pb-8">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold text-ink">Terms of service</h2>
            <p className="text-xs text-ink-soft">Last updated: {UPDATED}</p>
          </div>
          <div className="mt-5 space-y-5">
            {TERMS.map((t) => (
              <div key={t.title}>
                <h3 className="text-sm font-semibold text-ink">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confirmation note */}
      <section className="section pb-14">
        <div className="rounded-2xl border border-brand-500/20 bg-brand-50 p-6">
          <p className="text-sm text-brand-800">
            <strong>Before we begin any job</strong> you&apos;ll confirm:{' '}
            <em>&ldquo;I confirm I own this file or have permission to have it printed.&rdquo;</em>{' '}
            Questions about these terms? Email{' '}
            <span className="select-all font-semibold">{CONTACT_EMAIL}</span> or use our{' '}
            <Link to="/quote" className="font-semibold underline">
              quote form
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
