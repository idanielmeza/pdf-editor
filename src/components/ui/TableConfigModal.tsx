import { useState } from 'react'
import { useI18nStore } from '../../store/useI18nStore'

interface Props {
  onConfirm: (rows: number, cols: number) => void
  onClose: () => void
}

export default function TableConfigModal({ onConfirm, onClose }: Props) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const { t } = useI18nStore()

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 12, padding: '1.5rem', width: 280,
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>{t('insertTable')}</h3>
        <div className="prop-row" style={{ marginBottom: '0.8rem' }}>
          <label style={{ width: 60, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('rows')}</label>
          <input
            type="number" min={1} max={20} value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-primary)', padding: '0.3rem' }}
          />
        </div>
        <div className="prop-row" style={{ marginBottom: '1.2rem' }}>
          <label style={{ width: 60, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('columns')}</label>
          <input
            type="number" min={1} max={20} value={cols}
            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-primary)', padding: '0.3rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {Array.from({ length: Math.min(rows, 5) }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: Math.min(cols, 6) }).map((_, c) => (
                    <td key={c} style={{ border: '1px solid var(--border-color)', padding: '3px', background: r === 0 ? 'rgba(108,92,231,0.2)' : 'transparent', height: 14 }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(rows > 5 || cols > 6) && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem', textAlign: 'center' }}>
              {t('previewTruncated')}: {rows}×{cols}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => onConfirm(rows, cols)}>
            <i className="fas fa-table" /> {t('insert')}
          </button>
          <button className="btn" onClick={onClose}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  )
}
