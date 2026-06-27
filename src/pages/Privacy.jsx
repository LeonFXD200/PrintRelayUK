import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'

const CONTACT_EMAIL = 'printrelayuk@gmail.com'
const UPDATED = '27 June 2026'

// Small helper for consistent section styling.
function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

/**
 * UK-focused privacy policy for a small 3D-printing business, written in plain
 * English and aligned to the UK GDPR / Data Protection Act 2018.
 */
export default function Privacy() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How PrintRelay UK collects, uses and protects your personal information, in line with UK data protection law."
      />

      <section className="section py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          <p className="rounded-xl border border-ink/10 bg-paper-light px-4 py-3 text-sm text-ink-soft">
            <strong className="text-ink">Last updated:</strong> {UPDATED}. This policy explains your
            rights under the UK GDPR and the Data Protection Act 2018.
          </p>

          <Section id="who-we-are" title="1. Who we are">
            <p>
              PrintRelay UK (“we”, “us”, “our”) provides 3D printing and fulfilment services in the
              United Kingdom. For the purposes of UK data protection law, we are the “data
              controller” of the personal information you provide.
            </p>
            <p>
              You can contact us about privacy and data protection at{' '}
              <span className="font-medium text-ink">{CONTACT_EMAIL}</span>. We operate from
              Sevenoaks, Kent, United Kingdom.
            </p>
          </Section>

          <Section id="what-we-collect" title="2. What information we collect">
            <p>When you request a quote or place an order, we may collect:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">Contact details</strong> — your name, email address,
                phone number and (optionally) business name.
              </li>
              <li>
                <strong className="text-ink">Enquiry details</strong> — a description of what you
                need printed, quantity, material, colour, dimensions, deadline, budget and any notes.
              </li>
              <li>
                <strong className="text-ink">Uploaded files</strong> — any 3D model files you choose
                to attach (e.g. STL, 3MF, OBJ).
              </li>
              <li>
                <strong className="text-ink">Order &amp; delivery details</strong> — if you proceed,
                a delivery address and order history.
              </li>
              <li>
                <strong className="text-ink">Limited technical data</strong> — if spam protection
                (Cloudflare Turnstile) is enabled, it may process limited technical signals to
                confirm you are not a bot.
              </li>
            </ul>
            <p>
              We do not knowingly collect special category data, and we ask that you do not include
              it in your enquiry.
            </p>
          </Section>

          <Section id="how-we-use-it" title="3. How we use your information and our lawful bases">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">To respond to your enquiry and prepare a quote</strong>{' '}
                — on the basis of taking steps at your request prior to entering a contract, and your
                consent given when you submit the form.
              </li>
              <li>
                <strong className="text-ink">To fulfil your order</strong> — printing, quality
                checking, packing and dispatch — on the basis of performing our contract with you.
              </li>
              <li>
                <strong className="text-ink">To keep records and prevent fraud/abuse</strong> — on
                the basis of our legitimate interests in running the business safely.
              </li>
              <li>
                <strong className="text-ink">To meet legal obligations</strong> — for example,
                keeping accounting records.
              </li>
            </ul>
          </Section>

          <Section id="your-files" title="4. How we handle your files">
            <p>
              Your uploaded files are used <strong className="text-ink">only</strong> to quote, print
              and fulfil your specific order. They are not reused, resold, shared or printed for any
              other customer. See our{' '}
              <Link to="/terms" className="text-brand-600 underline">
                file responsibility &amp; terms
              </Link>{' '}
              page for more.
            </p>
          </Section>

          <Section id="sharing" title="5. Who we share information with">
            <p>
              We do not sell your personal information. We share it only with service providers
              (“processors”) that help us run the service, under appropriate agreements:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">Hosting &amp; database/storage</strong> — Supabase, to
                securely store enquiries and uploaded files in UK/EU data regions where available.
              </li>
              <li>
                <strong className="text-ink">Email delivery</strong> — Resend, to send you
                confirmation and reply emails.
              </li>
              <li>
                <strong className="text-ink">Spam protection</strong> — Cloudflare Turnstile, if
                enabled.
              </li>
              <li>
                <strong className="text-ink">Couriers</strong> — e.g. Royal Mail, Evri or DPD, to
                deliver completed orders.
              </li>
            </ul>
            <p>
              Where a provider processes data outside the UK, we rely on appropriate safeguards such
              as the UK International Data Transfer Agreement or addendum to the EU Standard
              Contractual Clauses.
            </p>
          </Section>

          <Section id="retention" title="6. How long we keep your information">
            <p>
              We keep enquiry details and any uploaded files for up to 12 months after your last
              contact if no order results, after which they are deleted. Where you place an order, we
              keep order and transaction records for up to 6 years to meet tax and accounting
              obligations.
            </p>
          </Section>

          <Section id="your-rights" title="7. Your rights">
            <p>Under UK data protection law you have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>access a copy of the personal information we hold about you;</li>
              <li>ask us to correct inaccurate or incomplete information;</li>
              <li>ask us to delete your information (the “right to erasure”);</li>
              <li>restrict or object to certain processing;</li>
              <li>request portability of information you provided to us;</li>
              <li>withdraw consent at any time, without affecting prior processing.</li>
            </ul>
            <p>
              To exercise any of these, email{' '}
              <span className="font-medium text-ink">{CONTACT_EMAIL}</span>. We will respond within
              one month.
            </p>
          </Section>

          <Section id="cookies" title="8. Cookies and local storage">
            <p>
              The website uses minimal cookies. In demo mode, your enquiries and preferences are
              stored only in your own browser’s local storage and are not sent anywhere. If spam
              protection is enabled, Cloudflare may set cookies necessary for that security function.
            </p>
          </Section>

          <Section id="security" title="9. How we protect your information">
            <p>
              We use reputable providers and access controls so that only the people fulfilling your
              order can see your enquiry and files. No method of transmission or storage is perfectly
              secure, but we take reasonable steps to protect your information.
            </p>
          </Section>

          <Section id="children" title="10. Children">
            <p>
              Our service is intended for businesses and adults. We do not knowingly collect personal
              information from children under 18.
            </p>
          </Section>

          <Section id="complaints" title="11. Complaints">
            <p>
              If you have a concern about how we handle your data, please contact us first. You also
              have the right to complain to the UK Information Commissioner’s Office (ICO) at{' '}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline"
              >
                ico.org.uk
              </a>
              .
            </p>
          </Section>

          <Section id="changes" title="12. Changes to this policy">
            <p>
              We may update this policy from time to time. The “last updated” date above shows when
              it last changed. Material changes will be reflected here before they take effect.
            </p>
          </Section>

          <div className="rounded-xl border border-brand-500/20 bg-brand-50 p-5 text-sm text-brand-800">
            Questions about your privacy? Email{' '}
            <span className="font-semibold">{CONTACT_EMAIL}</span> or use our{' '}
            <Link to="/quote" className="font-semibold underline">
              quote form
            </Link>
            .
          </div>
        </div>
      </section>
    </div>
  )
}
