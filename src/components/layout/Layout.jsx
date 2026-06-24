import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import DemoModeBanner from '../ui/DemoModeBanner.jsx'

/**
 * App shell: sticky navbar, page content, footer. Also scrolls to the top on
 * every route change (HashRouter doesn't do this for us).
 */
export default function Layout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <DemoModeBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
