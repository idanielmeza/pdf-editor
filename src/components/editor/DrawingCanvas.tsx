import { useRef, useEffect, useState } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import type { DrawingElement } from '../../types'

interface Props {
  width: number
  height: number
  color: string
  size: number
  onCommit: () => void
}

export default function DrawingCanvas({ width, height, color, size, onCommit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const addElement = usePdfStore((s) => s.addElement)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const { t } = useI18nStore()
  const [hasStrokes, setHasStrokes] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }, [width, height])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setHasStrokes(true)
  }

  function moveDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = false
  }

  function commit() {
    const canvas = canvasRef.current!
    const src = canvas.toDataURL('image/png')
    const el: DrawingElement = {
      type: 'drawing', id: crypto.randomUUID(),
      x: 0, y: 0, w: width, h: height, src,
    }
    addElement(el)
    setActiveTool(null)
    onCommit()
  }

  function clear() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, pointerEvents: 'auto' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      />
      {/* Toolbar */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 26,
      }}>
        <button className="btn danger" onClick={() => { setActiveTool(null); onCommit() }}>
          <i className="fas fa-times" /> {t('cancel')}
        </button>
        <button className="btn" onClick={clear} disabled={!hasStrokes}>
          <i className="fas fa-eraser" /> {t('clear')}
        </button>
        <button className="btn primary" onClick={commit} disabled={!hasStrokes}>
          <i className="fas fa-check" /> {t('apply')}
        </button>
      </div>
    </div>
  )
}
