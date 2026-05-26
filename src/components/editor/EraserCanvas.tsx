import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import type { ShapeElement } from '../../types'

interface Props {
  width: number
  height: number
  size: number
}

export default function EraserCanvas({ width, height, size }: Props) {
  const addElement = usePdfStore((s) => s.addElement)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const erasing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const el = (e.currentTarget as HTMLElement)
    const rect = el.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function paintWhite(x: number, y: number) {
    const half = size / 2
    const el: ShapeElement = {
      type: 'shape', id: crypto.randomUUID(), shapeType: 'rect',
      x: x - half, y: y - half, w: size, h: size,
      strokeColor: '#ffffff', fillColor: '#ffffff', strokeWidth: 0,
    }
    addElement(el)
  }

  function onStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    erasing.current = true
    const pos = getPos(e)
    lastPos.current = pos
    paintWhite(pos.x, pos.y)
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!erasing.current) return
    const pos = getPos(e)
    // Paint along path to avoid gaps
    const last = lastPos.current ?? pos
    const dist = Math.hypot(pos.x - last.x, pos.y - last.y)
    const steps = Math.max(1, Math.floor(dist / (size * 0.4)))
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      paintWhite(last.x + (pos.x - last.x) * t, last.y + (pos.y - last.y) * t)
    }
    lastPos.current = pos
  }

  function onEnd(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    erasing.current = false
    lastPos.current = null
  }

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0,
        width, height, zIndex: 25, pointerEvents: 'auto',
        cursor: 'none',
      }}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      {/* Eraser cursor preview handled via CSS on parent */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'auto',
      }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Borrador activo</span>
        <button className="btn primary" onMouseDown={(e) => { e.stopPropagation(); setActiveTool(null) }}>
          <i className="fas fa-check" /> Listo
        </button>
      </div>
    </div>
  )
}
