import { ShieldCheck, FileLock2, Ban, Check } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

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

/**
 * File-responsibility / terms page. Summarises ownership rules and the kinds of
 * files that may be rejected.
 */
export default function Terms() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="File responsibility and confidential handling"
        subtitle="Plain-English terms about how we treat your files and what you're responsible for when you upload."
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

      {/* Confirmation note */}
      <section className="section pb-14">
        <div className="rounded-2xl border border-brand-500/20 bg-brand-50 p-6">
          <p className="text-sm text-brand-800">
            <strong>At checkout</strong> you&apos;ll be asked to tick:{' '}
            <em>&ldquo;I confirm I own this file or have permission to have it printed.&rdquo;</em>{' '}
            This keeps everyone protected and is required before we begin any job.
          </p>
        </div>
      </section>
    </div>
  )
}
