import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { TextField, Select } from '../components/ui/Field.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please enter your name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more (10+ characters).'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSending(true)
    // Demo only, no real network call. In Supabase mode this would insert into
    // a `messages` table or trigger an email function.
    await new Promise((r) => setTimeout(r, 700))
    setSending(false)
    setSent(true)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a real person"
        subtitle="Questions about a job, bulk pricing, white-label setup or special requirements? We're happy to help."
      />

      <section className="section grid gap-8 py-12 lg:grid-cols-3">
        {/* Contact details */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email', text: 'hello@printrelay.uk' },
            { icon: MapPin, title: 'Based in', text: 'Manchester, United Kingdom' },
            { icon: Clock, title: 'Response time', text: 'Usually within one working day' },
            { icon: MessageSquare, title: 'Best for', text: 'Bulk, white-label and special jobs' },
          ].map((c) => (
            <div key={c.title} className="card flex items-start gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-pine-600">
                <c.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{c.title}</p>
                <p className="text-sm text-ink-soft">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card flex flex-col items-center p-10 text-center"
            >
              <CheckCircle2 size={44} className="text-emerald-600" />
              <h3 className="mt-4 text-xl font-semibold text-ink">Message sent</h3>
              <p className="mt-2 max-w-md text-ink-soft">
                Thanks {form.name.split(' ')[0]}. This is a demo, so nothing was actually emailed, but
                in the live app we&apos;d reply to {form.email} within a working day.
              </p>
              <button
                onClick={() => {
                  setSent(false)
                  setForm({ name: '', email: '', topic: 'general', message: '' })
                }}
                className="btn-ghost mt-6"
              >
                Send another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="card space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Your name" value={form.name} onChange={set('name')} placeholder="Jane Maker" error={errors.name} />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  error={errors.email}
                />
              </div>
              <Select
                label="Topic"
                value={form.topic}
                onChange={set('topic')}
                options={[
                  { value: 'general', label: 'General enquiry' },
                  { value: 'seller', label: 'Seller / white-label' },
                  { value: 'bulk', label: 'Bulk / batch order' },
                  { value: 'special', label: 'Special requirements' },
                ]}
              />
              <label className="block">
                <span className="field-label">Message</span>
                <textarea
                  className="field min-h-[140px] resize-y"
                  value={form.message}
                  onChange={(e) => set('message')(e.target.value)}
                  placeholder="Tell us about your job, volumes or deadline…"
                />
                {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}
              </label>
              <button type="submit" disabled={sending} className="btn-primary w-full py-3">
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending…
                  </>
                ) : (
                  'Send message'
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
