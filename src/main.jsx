import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// We use HashRouter (URLs like /#/estimator) so the app works on static hosts
// such as GitHub Pages without any server-side routing/redirect configuration.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Opt into React Router v7 behaviour early — silences future-flag warnings. */}
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
