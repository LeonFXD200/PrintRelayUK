import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Store, Shield, Loader2, ArrowRight } from 'lucide-react'
import { TextField, Select } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const DEMO_BUTTONS = [
  { role: 'customer', label: 'Demo customer', icon: User, hint: 'Track jobs and save preferences' },
  { role: 'seller', label: 'Demo seller', icon: Store, hint: 'White-label and overflow' },
  { role: 'admin', label: 'Demo admin', icon: Shield, hint: 'Manage the print queue' },
]

/**
 * Sign-in / register page. Supports email + password (demo), one-click demo
 * role logins, and routes admins to /admin and everyone else to their dashboard.
 *
 * @param {{defaultMode?: 'login' | 'register'}} props
 */
export default function Auth({ defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode)
  const { login, loginAsRole, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    role: 'customer',
    business_type: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  function routeAfter(user) {
    navigate(user?.role === 'admin' ? '/admin' : from, { replace: true })
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await login(form.email, form.password)
    setBusy(false)
    if (res.error) setError(res.error)
    else routeAfter(res.user)
  }

  async function handleDemo(role) {
    setBusy(true)
    const res = await loginAsRole(role)
    setBusy(false)
    if (!res.error) routeAfter(res.user)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name.trim()) return setError('Please enter your name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('Enter a valid email.')
    setBusy(true)
    const res = await register({
      full_name: form.full_name,
      email: form.email,
      company_name: form.company_name,
      role: form.role,
      business_type: form.business_type,
    })
    setBusy(false)
    if (res.error) setError(res.error)
    else routeAfter(res.user)
  }

  return (
    <div className="section flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-ink/10 shadow-card lg:grid-cols-2"
      >
        {/* Left: brand / demo logins (dark ink panel) */}
        <div className="hidden flex-col justify-between bg-ink p-8 text-paper-light lg:flex">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-light font-display text-lg font-bold text-ink">
                P
              </span>
              <span className="font-display text-xl font-semibold text-paper-light">
                PrintRelay <span className="text-clay-300">UK</span>
              </span>
            </Link>
            <h2 className="mt-8 text-2xl font-semibold text-paper-light">
              Track every job from quote to dispatch.
            </h2>
            <p className="mt-2 text-paper/60">
              No account yet? Jump straight in with a one-click demo login.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {DEMO_BUTTONS.map((d) => (
              <button
                key={d.role}
                onClick={() => handleDemo(d.role)}
                disabled={busy}
                className="flex w-full items-center gap-3 rounded-xl border border-paper/15 bg-paper/5 p-3 text-left transition hover:border-clay-400/50 hover:bg-paper/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-clay-500/20 text-clay-200">
                  <d.icon size={18} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-paper-light">{d.label}</span>
                  <span className="text-xs text-paper/60">{d.hint}</span>
                </span>
                <ArrowRight size={16} className="text-paper/50" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: form (light) */}
        <div className="bg-white p-8">
          {/* mode toggle */}
          <div className="mb-6 flex rounded-xl bg-ink/[0.05] p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  mode === m ? 'bg-ink text-paper-light' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="customer@printrelay.uk" />
              <TextField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="demo" />
              <button type="submit" disabled={busy} className="btn-primary w-full py-3">
                {busy ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
              </button>
              <p className="text-center text-xs text-ink-soft">
                Demo accounts use password <code className="text-clay-600">demo</code>. Or use the
                one-click logins.
              </p>
              {/* mobile demo buttons */}
              <div className="grid grid-cols-3 gap-2 lg:hidden">
                {DEMO_BUTTONS.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleDemo(d.role)}
                    disabled={busy}
                    className="rounded-lg border border-ink/10 bg-ink/[0.03] p-2 text-xs font-medium text-ink-light"
                  >
                    <d.icon size={16} className="mx-auto mb-1 text-clay-600" />
                    {d.role}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <TextField label="Full name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Maker" />
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              <Select
                label="I am a…"
                value={form.role}
                onChange={set('role')}
                options={[
                  { value: 'customer', label: 'Customer / maker' },
                  { value: 'seller', label: 'Seller / print farm' },
                ]}
              />
              {form.role === 'seller' && (
                <TextField label="Company name" value={form.company_name} onChange={set('company_name')} placeholder="Maker Lane Studio" />
              )}
              <TextField label="Business type (optional)" value={form.business_type} onChange={set('business_type')} placeholder="Etsy seller, prototyping…" />
              <button type="submit" disabled={busy} className="btn-primary w-full py-3">
                {busy ? <Loader2 size={18} className="animate-spin" /> : 'Create demo account'}
              </button>
              <p className="text-center text-xs text-ink-soft">
                Demo only. Your account lives in this browser, not a real server.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
