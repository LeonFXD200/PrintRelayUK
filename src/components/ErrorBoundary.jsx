import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * Catches render-time errors in its subtree and shows a friendly fallback
 * instead of a blank white screen. Used at the route level and around the
 * three.js viewer (which is the most likely thing to throw on odd input).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // In a real app this would report to Sentry/LogRocket etc.
    // eslint-disable-next-line no-console
    console.error('[PrintRelay UK] Caught render error:', error, info)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (!this.state.hasError) return this.props.children

    // Compact variant for wrapping a single widget (e.g. the 3D viewer).
    if (this.props.compact) {
      return (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-red-400/40 bg-red-50 p-6 text-center">
          <AlertTriangle size={28} className="text-red-500" />
          <p className="mt-2 text-sm font-medium text-ink">Preview unavailable</p>
          <p className="mt-1 text-xs text-ink-soft">
            We couldn&apos;t render this model, but your estimate is unaffected.
          </p>
        </div>
      )
    }

    return (
      <div className="section flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle size={30} />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 max-w-md text-ink-soft">
          An unexpected error occurred while rendering this page. You can retry, or head back home.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={this.reset} className="btn-primary">
            <RotateCcw size={16} /> Try again
          </button>
          <a href="#/" className="btn-ghost" onClick={this.reset}>
            Go home
          </a>
        </div>
      </div>
    )
  }
}
