import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { applyRouteMeta } from './utils/seo.js'

// Pages
import Home from './pages/Home.jsx'
import Estimator from './pages/Estimator.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import Pricing from './pages/Pricing.jsx'
import Materials from './pages/Materials.jsx'
import SellerOverflow from './pages/SellerOverflow.jsx'
import CustomerDashboard from './pages/CustomerDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Auth from './pages/Auth.jsx'
import FAQ from './pages/FAQ.jsx'
import Terms from './pages/Terms.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * Guards a route. Redirects to /login if signed out, or home if an admin-only
 * route is accessed without the admin role.
 */
function Protected({ children, adminOnly = false }) {
  const { isAuthed, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthed) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  // Keep the document title + meta description in sync with the active route.
  const { pathname } = useLocation()
  useEffect(() => {
    applyRouteMeta(pathname)
  }, [pathname])

  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estimator" element={<Estimator />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/sellers" element={<SellerOverflow />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth defaultMode="register" />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <CustomerDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected adminOnly>
              <AdminDashboard />
            </Protected>
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}
