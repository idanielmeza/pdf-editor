import { useRef, useState } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import type { HighlightElement } from '../../types'

interface Props {
  width: number
  height: number
  color: string
  opacity: number
}

export default function HighlightCanvas({ width, height, color, opacity }: Props) {
  const addElement = usePdfStore((s) => s.addElement)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const { t } = useI18nStore()
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const [preview, setPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  function getPos(e: React.MouseEvent): { x: number; y: number } {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    startPos.current = getPos(e)
    setPreview(null)
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!startPos.current) return
    const pos = getPos(e)
    const x = Math.min(startPos.current.x, pos.x)
    const y = Math.min(startPos.current.y, pos.y)
    const w = Math.abs(pos.x - startPos.current.x)
    const h = Math.abs(pos.y - startPos.current.y)
    setPreview({ x, y, w, h })
  }

  function onMouseUp(e: React.MouseEvent) {
    if (!startPos.current) return
    const pos = getPos(e)
    const x = Math.min(startPos.current.x, pos.x)
    const y = Math.min(startPos.current.y, pos.y)
    const w = Math.abs(pos.x - startPos.current.x)
    const h = Math.abs(pos.y - startPos.current.y)
    startPos.current = null
    setPreview(null)
    if (w < 5 || h < 5) return
    const el: HighlightElement = {
      type: 'highlight', id: crypto.randomUUID(),
      x, y, w, h, color, opacity,
    }
    addElement(el)
  }

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0,
        width, height, zIndex: 24, pointerEvents: 'auto',
        cursor: 'crosshair',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { startPos.current = null; setPreview(null) }}
    >
      {preview && (
        <div style={{
          position: 'absolute',
          left: preview.x, top: preview.y,
          width: preview.w, height: preview.h,
          background: color,
          opacity,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'auto',
        zIndex: 25,
      }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('dragToHighlight')}</span>
        <button className="btn primary" onMouseDown={(e) => { e.stopPropagation(); setActiveTool(null) }}>
          <i className="fas fa-check" /> {t('done')}
        </button>
      </div>
    </div>
  )
}
