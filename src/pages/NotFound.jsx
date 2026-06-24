import { Link } from 'react-router-dom'
import { Boxes, Home, ArrowLeft } from 'lucide-react'

/**
 * 404 page shown for any route that doesn't match (the catch-all in App.jsx).
 */
export default function NotFound() {
  return (
    <div className="section flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-clay-50 text-clay-600">
        <Boxes size={30} />
      </span>
      <p className="mt-6 font-display text-6xl font-semibold text-ink">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">
        This page didn&apos;t make it off the print bed
      </h1>
      <p className="mt-2 max-w-md text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on
        track.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">
          <Home size={16} /> Home
        </Link>
        <Link to="/estimator" className="btn-ghost">
          <ArrowLeft size={16} /> Estimate a print
        </Link>
      </div>
    </div>
  )
}
