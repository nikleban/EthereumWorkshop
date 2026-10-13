import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { NetworkProvider } from '@/context/NetworkContext'

// On page refresh, always start again from the root route
const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
if (navEntry?.type === 'reload' && window.location.pathname !== '/') {
  window.history.replaceState(null, '', '/')
}

// Every RPC call costs Alchemy quota, so don't refetch just because the tab regained focus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NetworkProvider>
          <App />
        </NetworkProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
