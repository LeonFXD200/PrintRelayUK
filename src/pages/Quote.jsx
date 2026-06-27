import { useLocation } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import QuoteForm from '../components/quote/QuoteForm.jsx'

/**
 * /quote — the in-site quote request page. Replaces the old mailto flow: every
 * "request a quote" CTA now lands here. The estimator can hand over a `prefill`
 * object via router state so the customer doesn't retype their spec.
 */
export default function Quote() {
  const location = useLocation()
  const prefill = location.state?.prefill || null

  return (
    <div>
      <PageHeader
        eyebrow="Request a reviewed quote"
        title="Tell us about your print"
        subtitle="Send us the details and we’ll reply with a fixed price and lead time, usually within 1–2 working days. No account needed."
      />

      <div className="section py-10">
        <QuoteForm prefill={prefill} />
      </div>
    </div>
  )
}
