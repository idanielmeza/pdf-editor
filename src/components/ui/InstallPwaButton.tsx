import { useEffect, useState } from 'react'
import { useI18nStore } from '../../store/useI18nStore'

export default function InstallPwaButton() {
  const [prompt, setPrompt] = useState<any>(() => (window as any).__pwaInstallPrompt ?? null)
  const [installed, setInstalled] = useState(false)
  const { t } = useI18nStore()

  useEffect(() => {
    // Pick up prompt if already captured before mount
    if ((window as any).__pwaInstallPrompt) {
      setPrompt((window as any).__pwaInstallPrompt)
    }

    const onReady = () => setPrompt((window as any).__pwaInstallPrompt)
    const onInstalled = () => { setInstalled(true); setPrompt(null) }

    window.addEventListener('pwaPromptReady', onReady)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwaPromptReady', onReady)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !prompt) return null

  async function install() {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    ;(window as any).__pwaInstallPrompt = null
    setPrompt(null)
  }

  return (
    <button
      className="btn primary"
      title="Instalar como aplicación"
      onClick={install}
    >
      <i className="fas fa-download" /> {t('installApp')}
    </button>
  )
}
