import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, LayoutDashboard, Shield, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

// Primary navigation links shown to everyone.
const NAV_LINKS = [
  { to: '/estimator', label: 'Estimate' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/materials', label: 'Materials' },
  { to: '/sellers', label: 'For sellers' },
  { to: '/faq', label: 'FAQ' },
]

// Brand wordmark — a small ink monogram tile plus the name.
function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-paper-light">
        P
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        PrintRelay <span className="text-clay-600">UK</span>
      </span>
    </span>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive ? 'text-ink bg-ink/[0.06]' : 'text-ink-soft hover:text-ink hover:bg-ink/[0.04]'
    }`

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-lg">
      <nav className="section flex h-16 items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className="btn-ghost px-3 py-2 text-sm">
                  <Shield size={16} /> Admin
                </NavLink>
              )}
              <NavLink to="/dashboard" className="btn-ghost px-3 py-2 text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <button onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost px-4 py-2 text-sm">
                <User size={16} /> Sign in
              </NavLink>
              <NavLink to="/estimator" className="btn-primary px-4 py-2 text-sm">
                Estimate a print
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-ink hover:bg-ink/[0.06] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-ink/10 bg-paper-light lg:hidden"
          >
            <div className="section flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
              <div className="my-2 h-px bg-ink/10" />
              {user ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                      Admin dashboard
                    </NavLink>
                  )}
                  <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                    My dashboard
                  </NavLink>
                  <button onClick={handleLogout} className="btn-ghost mt-2 w-full">
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn-ghost w-full" onClick={() => setOpen(false)}>
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/estimator"
                    className="btn-primary mt-2 w-full"
                    onClick={() => setOpen(false)}
                  >
                    Estimate a print
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
