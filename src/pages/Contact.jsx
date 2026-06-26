import { Link } from 'react-router-dom'
import { Mail, MapPin, Clock, MessageSquare, Info } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const CONTACT_EMAIL = 'printrelayuk@gmail.com'

const INFO_CARDS = [
  {
    icon: Mail,
    title: 'Email',
    body: (
      <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-sm text-brand-600 hover:underline">
        {CONTACT_EMAIL}
      </a>
    ),
  },
  {
    icon: Clock,
    title: 'Response time',
    body: 'We aim to respond within 1–2 working days, Monday to Friday.',
  },
  {
    icon: MapPin,
    title: 'Based in',
    body: 'Sevenoaks, Kent, United Kingdom',
  },
  {
    icon: MessageSquare,
    title: 'Best for',
    body: 'Order queries, bulk pricing, white-label setup and special requirements.',
  },
]

const INCLUDE_ITEMS = [
  {
    label: 'Order or quote reference',
    detail: 'Your PR- reference number from your dashboard or order confirmation.',
  },
  {
    label: 'File name',
    detail: 'The name of the model file related to your query.',
  },
  {
    label: 'Issue description',
    detail: 'A clear explanation of the problem or question.',
  },
  {
    label: 'Screenshots or photos',
    detail: 'For print quality issues, close-up photos help us assess the problem quickly.',
  },
]

export default function Contact() {
  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title="Get in touch"
        subtitle="Questions about a job, bulk pricing, white-label setup or a print issue? We're here to help."
      />

      <section className="section grid gap-8 py-12 lg:grid-cols-3">
        {/* Left: contact info */}
        <div className="space-y-4">
          {INFO_CARDS.map((c) => (
            <div key={c.title} className="card flex items-start gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <c.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{c.title}</p>
                {typeof c.body === 'string' ? (
                  <p className="text-sm text-ink-soft">{c.body}</p>
                ) : (
                  c.body
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: email CTA + what to include */}
        <div className="space-y-5 lg:col-span-2">
          {/* Email support */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink">Email our support team</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Send us an email and we will get back to you. We aim to respond within 1–2 working
              days, Monday to Friday.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=PrintRelay%20Support%20Enquiry`}
              className="btn-primary mt-4 inline-flex"
            >
              <Mail size={18} />
              Send us an email
            </a>
            <p className="mt-2 text-xs text-ink-soft">
              Opens your email client addressed to {CONTACT_EMAIL}
            </p>
          </div>

          {/* What to include */}
          <div className="card p-6">
            <div className="mb-1 flex items-center gap-2">
              <Info size={17} className="shrink-0 text-brand-600" />
              <h2 className="text-lg font-semibold text-ink">What to include in your message</h2>
            </div>
            <p className="text-sm text-ink-soft">
              Including the following details helps us respond quickly and accurately.
            </p>
            <ul className="mt-4 space-y-3">
              {INCLUDE_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-sm text-ink-soft">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ callout */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-5">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">Have a general question?</span>{' '}
              Check the{' '}
              <Link to="/faq" className="text-brand-600 hover:underline">
                FAQ page
              </Link>{' '}
              first — it covers file formats, materials, pricing, dispatch, copyright and refunds.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
