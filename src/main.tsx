import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './store/useThemeStore'

// Capture beforeinstallprompt early, before React mounts
;(window as any).__pwaInstallPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  ;(window as any).__pwaInstallPrompt = e
  window.dispatchEvent(new Event('pwaPromptReady'))
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
