import { useRef, useState, useEffect } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import type { ImageElement } from '../../types'

interface Props { onClose: () => void }

type Tab = 'draw' | 'upload'

export default function SignatureModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('draw')
  const [penColor, setPenColor] = useState('#000000')
  const [penWidth, setPenWidth] = useState(2)
  const [isEmpty, setIsEmpty] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const addElement = usePdfStore((s) => s.addElement)
  const addToast = usePdfStore((s) => s.addToast)
  const viewportRef = usePdfStore((s) => s.viewportRef)

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = penColor
    ctx.lineWidth = penWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = penColor
    ctx.lineWidth = penWidth
  }, [penColor, penWidth])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    isDrawing.current = true
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsEmpty(false)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function stopDraw() { isDrawing.current = false }

  function clearCanvas() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  function insertDrawnSignature() {
    const canvas = canvasRef.current!
    if (isEmpty) return addToast('Dibuja una firma primero', 'info')
    const dataUrl = canvas.toDataURL('image/png')
    insertSignatureImage(dataUrl, 300, 100)
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      insertSignatureImage(ev.target?.result as string, 200, 80)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function insertSignatureImage(src: string, w: number, h: number) {
    const cx = viewportRef ? viewportRef.width / 2 - w / 2 : 100
    const cy = viewportRef ? viewportRef.height - 150 : 400
    const el: ImageElement = {
      type: 'image', id: crypto.randomUUID(),
      x: cx, y: cy, w, h, src,
    }
    addElement(el)
    addToast('Firma insertada', 'success')
    onClose()
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer',
    background: tab === t ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
    color: tab === t ? 'white' : 'var(--text-secondary)',
    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 500,
    transition: 'all 0.2s',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 14, padding: '1.5rem', width: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
            <i className="fas fa-signature" style={{ marginRight: 8, color: 'var(--accent-secondary)' }} />
            Insertar Firma
          </h3>
          <button className="btn" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <button style={tabStyle('draw')} onClick={() => setTab('draw')}>
            <i className="fas fa-pen" style={{ marginRight: 6 }} />Dibujar
          </button>
          <button style={tabStyle('upload')} onClick={() => setTab('upload')}>
            <i className="fas fa-upload" style={{ marginRight: 6 }} />Subir imagen
          </button>
        </div>

        {tab === 'draw' && (
          <>
            {/* Pen controls */}
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <label>Color</label>
                <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)}
                  style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <label>Grosor</label>
                <input type="range" min={1} max={8} value={penWidth} onChange={(e) => setPenWidth(parseInt(e.target.value))}
                  style={{ width: 80 }} />
                <span>{penWidth}px</span>
              </div>
              <button className="btn" onClick={clearCanvas} style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                <i className="fas fa-eraser" /> Limpiar
              </button>
            </div>

            {/* Drawing canvas */}
            <div style={{ border: '2px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', marginBottom: '1rem', background: '#fff', cursor: 'crosshair' }}>
              <canvas
                ref={canvasRef}
                width={440}
                height={160}
                style={{ display: 'block', width: '100%', touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Dibuja tu firma en el área blanca. Puedes usar mouse o pantalla táctil.
            </p>
            <button className="btn primary" style={{ width: '100%' }} onClick={insertDrawnSignature}>
              <i className="fas fa-check" /> Insertar firma dibujada
            </button>
          </>
        )}

        {tab === 'upload' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <i className="fas fa-file-image" style={{ fontSize: '3rem', color: 'var(--accent-secondary)', marginBottom: '1rem', display: 'block' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Sube una imagen PNG/JPG de tu firma.<br />
              Se recomienda fondo transparente (PNG).
            </p>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.2rem', background: 'var(--accent-gradient)',
              color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            }}>
              <i className="fas fa-upload" />
              Seleccionar imagen
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
