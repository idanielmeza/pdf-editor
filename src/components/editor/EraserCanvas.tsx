import { useRef, useEffect } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import type { DrawingElement } from '../../types'

interface Props {
  width: number
  height: number
  size: number
  color: string
}

export default function EraserCanvas({ width, height, size, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const addElement = usePdfStore((s) => s.addElement)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const { t } = useI18nStore()
  const erasing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const hasStrokes = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasStrokes.current = false
  }, [width, height])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function paintWhite(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  function onStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = color
    erasing.current = true
    const pos = getPos(e)
    lastPos.current = pos
    paintWhite(ctx, pos.x, pos.y)
    hasStrokes.current = true
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!erasing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = color
    const pos = getPos(e)
    const last = lastPos.current ?? pos
    const dist = Math.hypot(pos.x - last.x, pos.y - last.y)
    const steps = Math.max(1, Math.floor(dist / (size * 0.3)))
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      paintWhite(ctx, last.x + (pos.x - last.x) * t, last.y + (pos.y - last.y) * t)
    }
    lastPos.current = pos
  }

  function onEnd(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!erasing.current) return
    erasing.current = false
    lastPos.current = null
    // Commit current stroke as DrawingElement, keep canvas for more strokes
    if (hasStrokes.current) {
      const canvas = canvasRef.current!
      const src = canvas.toDataURL('image/png')
      const el: DrawingElement = {
        type: 'drawing', id: crypto.randomUUID(),
        x: 0, y: 0, w: width, h: height, src, eraser: true,
      }
      addElement(el)
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      hasStrokes.current = false
    }
  }

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0,
        width, height, zIndex: 25, pointerEvents: 'auto',
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='${size/2 - 1}' fill='${encodeURIComponent(color)}' stroke='%23999' stroke-width='1'/%3E%3C/svg%3E") ${size/2} ${size/2}, crosshair`,
      }}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'auto',
      }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('eraserActive')}</span>
        <button className="btn primary" onMouseDown={(e) => { e.stopPropagation(); setActiveTool(null) }}>
          <i className="fas fa-check" /> {t('done')}
        </button>
      </div>
    </div>
  )
}
