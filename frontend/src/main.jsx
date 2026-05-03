import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function MissingConfig() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: 12, fontSize: 28 }}>TeamSync needs one frontend variable</h1>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Set VITE_CLERK_PUBLISHABLE_KEY in the frontend service variables on Railway,
          then redeploy the frontend.
        </p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <MissingConfig />
    )}
  </StrictMode>,
)
