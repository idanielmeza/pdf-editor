import { useRef, useState } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import { t } from '../../store/useI18nStore'
import ToolbarGroup from './ToolbarGroup'
import ReplaceTextModal from '../ui/ReplaceTextModal'
import TableConfigModal from '../ui/TableConfigModal'
import SignatureModal from '../ui/SignatureModal'
import type { ImageElement, ShapeElement, ShapeType } from '../../types'
import type { ChangeEvent } from 'react'

export default function EditActions() {
  const imgRef = useRef<HTMLInputElement>(null)
  const activeTool = usePdfStore((s) => s.activeTool)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const addElement = usePdfStore((s) => s.addElement)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const currentPage = usePdfStore((s) => s.currentPage)
  const runOcr = usePdfStore((s) => s.runOcr)
  const addToast = usePdfStore((s) => s.addToast)
  const viewportRef = usePdfStore((s) => s.viewportRef)
  const drawColor = usePdfStore((s) => s.drawColor)
  const drawSize = usePdfStore((s) => s.drawSize)
  const setDrawColor = usePdfStore((s) => s.setDrawColor)
  const setDrawSize = usePdfStore((s) => s.setDrawSize)
  const [showReplace, setShowReplace] = useState(false)
  const [showTableConfig, setShowTableConfig] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const { t: tHook } = useI18nStore()

  function toggleText() { setActiveTool(activeTool === 'text' ? null : 'text') }
  function toggleDraw() { setActiveTool(activeTool === 'draw' ? null : 'draw') }

  function handleImgSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const el: ImageElement = {
        type: 'image', id: crypto.randomUUID(),
        x: 50, y: 50, w: 200, h: 150,
        src: ev.target?.result as string,
      }
      addElement(el)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function addShape(shapeType: ShapeType) {
    if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info')
    const cx = viewportRef ? viewportRef.width / 2 : 100
    const cy = viewportRef ? viewportRef.height / 2 : 100
    const el: ShapeElement = {
      type: 'shape', id: crypto.randomUUID(), shapeType,
      x: cx - 60, y: cy - 40, w: 120, h: 80,
      strokeColor: '#000000', fillColor: 'transparent', strokeWidth: 2,
    }
    addElement(el)
  }

  async function handleOcr() {
    if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info')
    const canvas = document.querySelector<HTMLCanvasElement>('#pdf-canvas')
    if (!canvas) return
    await runOcr(currentPage, canvas)
  }

  return (
    <>
      <ToolbarGroup>
        <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgSelect} />
        <button className={`btn ${activeTool === 'text' ? 'active' : ''}`} title="Activar herramienta de texto — clic en página para agregar texto" onClick={toggleText}>
          <i className="fas fa-font" /> {tHook('text')}
        </button>
        <button className="btn" title="Insertar imagen en la página actual" onClick={() => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); imgRef.current?.click() }}>
          <i className="fas fa-image" /> {tHook('image')}
        </button>
        <button className="btn" title="Ejecutar OCR para detectar texto en PDFs escaneados" onClick={handleOcr}>
          <i className="fas fa-microscope" /> {tHook('ocr')}
        </button>
        <button className="btn" title="Buscar y reemplazar texto en la página actual" onClick={() => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); setShowReplace(true) }}>
          <i className="fas fa-exchange-alt" /> {tHook('replace')}
        </button>
        <button className="btn" title="Insertar firma dibujada o desde imagen" onClick={() => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); setShowSignature(true) }}>
          <i className="fas fa-signature" /> {tHook('signature')}
        </button>
        <button
          className={`btn ${activeTool === 'draw' ? 'active' : ''}`}
          title="Dibujar a mano alzada sobre la página"
          onClick={() => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); toggleDraw() }}
          disabled={!pdfDoc}
        >
          <i className="fas fa-pencil-alt" /> {tHook('draw') ?? 'Borrador'}
        </button>
        {activeTool === 'draw' && (
          <>
            <input type="color" value={drawColor} title="Color del borrador"
              style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDrawColor(e.target.value)}
            />
            <input type="range" min={1} max={30} value={drawSize} title="Grosor del borrador"
              style={{ width: 70, accentColor: 'var(--accent-primary)' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDrawSize(parseInt(e.target.value))}
            />
          </>
        )}
      </ToolbarGroup>
      <ToolbarGroup>
        <button className="btn" onClick={() => addShape('rect')} disabled={!pdfDoc} title="Rectángulo">
          <i className="fas fa-square" />
        </button>
        <button className="btn" onClick={() => addShape('circle')} disabled={!pdfDoc} title="Círculo">
          <i className="fas fa-circle" />
        </button>
        <button className="btn" onClick={() => addShape('line')} disabled={!pdfDoc} title="Línea">
          <i className="fas fa-minus" />
        </button>
        <button className="btn" onClick={() => addShape('arrow')} disabled={!pdfDoc} title="Flecha">
          <i className="fas fa-arrow-right" />
        </button>
        <button className="btn" onClick={() => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); setShowTableConfig(true) }} disabled={!pdfDoc} title="Insertar tabla con filas y columnas personalizadas">
          <i className="fas fa-table" /> {tHook('table')}
        </button>
      </ToolbarGroup>
      {showReplace && <ReplaceTextModal onClose={() => setShowReplace(false)} />}
      {showSignature && <SignatureModal onClose={() => setShowSignature(false)} />}
      {showTableConfig && (
        <TableConfigModal
          onClose={() => setShowTableConfig(false)}
          onConfirm={(rows, cols) => {
            setShowTableConfig(false)
            const colW = 80, rowH = 30
            const cx = viewportRef ? viewportRef.width / 2 : 200
            const cy = viewportRef ? viewportRef.height / 2 : 200
            const el: any = {
              type: 'table', id: crypto.randomUUID(),
              x: cx - (cols * colW) / 2, y: cy - (rows * rowH) / 2,
              rows, cols,
              colWidths: Array(cols).fill(colW),
              rowHeights: Array(rows).fill(rowH),
              cells: Array(rows).fill(null).map((_, r) =>
                Array(cols).fill(null).map((_, c) => r === 0 ? `Col ${c + 1}` : '')
              ),
              borderColor: '#000000', headerBg: '#e8e8e8', fontSize: 12,
            }
            addElement(el)
          }}
        />
      )}
    </>
  )
}
