import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'

export default function OcrOverlay() {
  const ocrActive = usePdfStore((s) => s.ocrActive)
  const ocrProgress = usePdfStore((s) => s.ocrProgress)
  const { t } = useI18nStore()

  if (!ocrActive) return null

  return (
    <div className="ocr-overlay active">
      <div className="ocr-card">
        <div style={{ width: 40, height: 40, border: '3px solid #333', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>{t('ocrProcessing')}</h3>
        <div className="ocr-bar">
          <div className="ocr-fill" style={{ width: `${ocrProgress}%` }} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {ocrProgress < 30 ? t('ocrStarting') : `${Math.round(ocrProgress)}%`}
        </p>
      </div>
    </div>
  )
}
