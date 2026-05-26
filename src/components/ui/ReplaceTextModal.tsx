import { useState } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import { t as tFn } from '../../store/useI18nStore'

interface Props { onClose: () => void }

export default function ReplaceTextModal({ onClose }: Props) {
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matches, setMatches] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const currentPage = usePdfStore((s) => s.currentPage)
  const zoom = usePdfStore((s) => s.zoom)
  const addElement = usePdfStore((s) => s.addElement)
  const addToast = usePdfStore((s) => s.addToast)
  const { t } = useI18nStore()

  async function handleSearch() {
    if (!pdfDoc || !searchText.trim()) return
    setSearching(true)
    const page = await pdfDoc.getPage(currentPage)
    const viewport = page.getViewport({ scale: 1.5 * zoom })
    const vt = viewport.transform as number[]
    const tc = await page.getTextContent()
    const found: any[] = []
    for (const item of tc.items as any[]) {
      if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
        const [, , , , x, y] = item.transform
        const cssX = vt[0] * x + vt[2] * y + vt[4]
        const cssY = vt[1] * x + vt[3] * y + vt[5]
        const scale = Math.abs(vt[3])
        found.push({
          str: item.str, x: cssX, y: cssY - item.height * scale,
          w: item.width * scale, h: item.height * scale,
          fontSize: item.height * scale,
          item,
        })
      }
    }
    setMatches(found)
    setSearching(false)
    if (!found.length) addToast(tFn('toastNotFound'), 'info')
  }

  function handleReplace(match: any) {
    addElement({
      type: 'shape', id: crypto.randomUUID(), shapeType: 'rect',
      x: match.x - 1, y: match.y - 1,
      w: match.w + 2, h: match.h + 4,
      strokeColor: '#ffffff', fillColor: '#ffffff', strokeWidth: 0,
    } as any)
    addElement({
      type: 'text', id: crypto.randomUUID(),
      x: match.x, y: match.y,
      content: replaceText, font: 'Inter',
      size: Math.round(match.fontSize),
      color: '#000000',
    })
    addToast(tFn('toastReplaced'), 'success')
  }

  function handleReplaceAll() {
    matches.forEach((m) => handleReplace(m))
    setMatches([])
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 12, padding: '1.5rem', minWidth: 400, maxWidth: 500
      }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('searchReplace')}</h3>
        <div className="prop-row" style={{ marginBottom: '0.8rem' }}>
          <label style={{ width: 80 }}>{t('search')}</label>
          <input
            style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-primary)', padding: '0.4rem' }}
            value={searchText} onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Texto a buscar..."
          />
        </div>
        <div className="prop-row" style={{ marginBottom: '1rem' }}>
          <label style={{ width: 80 }}>{t('replaceLabel')}</label>
          <input
            style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-primary)', padding: '0.4rem' }}
            value={replaceText} onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Nuevo texto..."
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn primary" onClick={handleSearch} disabled={searching} style={{ flex: 1 }}>
            <i className="fas fa-search" /> {searching ? t('searching') : t('search')}
          </button>
          {matches.length > 0 && (
            <button className="btn" onClick={handleReplaceAll} style={{ flex: 1 }}>
              <i className="fas fa-exchange-alt" /> {t('replaceAll')} ({matches.length})
            </button>
          )}
          <button className="btn" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        {matches.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {matches.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{m.str}"</span>
                <button className="btn" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={() => handleReplace(m)}>
                  {t('replaceOne')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
