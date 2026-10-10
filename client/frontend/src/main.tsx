import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { NetworkProvider } from '@/context/NetworkContext'

// On page refresh, always start again from the root route
const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
if (navEntry?.type === 'reload' && window.location.pathname !== '/') {
  window.history.replaceState(null, '', '/')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <NetworkProvider>
          <App />
        </NetworkProvider>
      </BrowserRouter>
  </StrictMode>,
)
