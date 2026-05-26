import { useState } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import { t } from '../../store/useI18nStore'
import ToolbarGroup from './ToolbarGroup'
import ReplaceTextModal from '../ui/ReplaceTextModal'
import TableConfigModal from '../ui/TableConfigModal'
import SignatureModal from '../ui/SignatureModal'
import type { ImageElement, ShapeElement, ShapeType } from '../../types'
import type { ChangeEvent } from 'react'

function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export default function EditActions() {
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
  const eraserSize = usePdfStore((s) => s.eraserSize)
  const eraserColor = usePdfStore((s) => s.eraserColor)
  const highlightColor = usePdfStore((s) => s.highlightColor)
  const highlightOpacity = usePdfStore((s) => s.highlightOpacity)
  const setDrawColor = usePdfStore((s) => s.setDrawColor)
  const setDrawSize = usePdfStore((s) => s.setDrawSize)
  const setEraserSize = usePdfStore((s) => s.setEraserSize)
  const setEraserColor = usePdfStore((s) => s.setEraserColor)
  const setHighlightColor = usePdfStore((s) => s.setHighlightColor)
  const setHighlightOpacity = usePdfStore((s) => s.setHighlightOpacity)
  const [showReplace, setShowReplace] = useState(false)
  const [showTableConfig, setShowTableConfig] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const { t: tHook } = useI18nStore()

  const need = (fn: () => void) => () => { if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info'); fn() }

  function toggleText() { setActiveTool(activeTool === 'text' ? null : 'text') }
  function toggleDraw() { setActiveTool(activeTool === 'draw' ? null : 'draw') }
  function toggleEraser() { setActiveTool(activeTool === 'eraser' ? null : 'eraser') }
  function toggleHighlight() { setActiveTool(activeTool === 'highlight' ? null : 'highlight') }

  async function handleImgSelect() {
    if (!pdfDoc) return addToast(t('toastOpenFirst'), 'info')
    const file = await pickImage()
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
      {/* Group 1: Insert / annotate */}
      <ToolbarGroup>
        <button className={`btn ${activeTool === 'text' ? 'active' : ''}`} title="Agregar texto" onClick={toggleText}>
          <i className="fas fa-font" /> {tHook('text')}
        </button>
        <button className="btn" title="Insertar imagen" onClick={handleImgSelect}>
          <i className="fas fa-image" /> {tHook('image')}
        </button>
        <button className="btn" title="Insertar firma" onClick={need(() => setShowSignature(true))}>
          <i className="fas fa-signature" /> {tHook('signature')}
        </button>
        <button className="btn" title="Buscar y reemplazar texto" onClick={need(() => setShowReplace(true))}>
          <i className="fas fa-exchange-alt" /> {tHook('replace')}
        </button>
        <button className="btn" title="OCR — detectar texto en PDF escaneado" onClick={handleOcr}>
          <i className="fas fa-microscope" /> {tHook('ocr')}
        </button>
      </ToolbarGroup>

      {/* Group 2: Draw / erase / highlight */}
      <ToolbarGroup>
        <button
          className={`btn ${activeTool === 'draw' ? 'active' : ''}`}
          title="Dibujar a mano alzada"
          onClick={need(toggleDraw)}
          disabled={!pdfDoc}
        >
          <i className="fas fa-pencil-alt" /> {tHook('draw')}
        </button>
        {activeTool === 'draw' && (
          <>
            <input type="color" value={drawColor} title="Color"
              style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDrawColor(e.target.value)}
            />
            <input type="range" min={1} max={30} value={drawSize} title="Grosor"
              style={{ width: 60, accentColor: 'var(--accent-primary)' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDrawSize(parseInt(e.target.value))}
            />
          </>
        )}
        <button
          className={`btn ${activeTool === 'eraser' ? 'active' : ''}`}
          title="Borrador — cubre contenido del PDF"
          onClick={need(toggleEraser)}
          disabled={!pdfDoc}
        >
          <i className="fas fa-eraser" /> {tHook('eraser')}
        </button>
        {activeTool === 'eraser' && (
          <>
            <input type="color" value={eraserColor} title="Color"
              style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEraserColor(e.target.value)}
            />
            <input type="range" min={5} max={80} value={eraserSize} title="Tamaño"
              style={{ width: 60, accentColor: 'var(--accent-primary)' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEraserSize(parseInt(e.target.value))}
            />
          </>
        )}
        <button
          className={`btn ${activeTool === 'highlight' ? 'active' : ''}`}
          title="Resaltar / subrayar"
          onClick={need(toggleHighlight)}
          disabled={!pdfDoc}
        >
          <i className="fas fa-highlighter" /> {tHook('highlight')}
        </button>
        {activeTool === 'highlight' && (
          <>
            <input type="color" value={highlightColor} title="Color"
              style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHighlightColor(e.target.value)}
            />
            <input type="range" min={10} max={100} value={Math.round(highlightOpacity * 100)} title="Opacidad"
              style={{ width: 60, accentColor: 'var(--accent-primary)' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHighlightOpacity(parseInt(e.target.value) / 100)}
            />
          </>
        )}
      </ToolbarGroup>

      {/* Group 3: Shapes */}
      <ToolbarGroup>
        <button className="btn" onClick={() => addShape('rect')} disabled={!pdfDoc} title="Rectángulo"><i className="fas fa-square" /></button>
        <button className="btn" onClick={() => addShape('circle')} disabled={!pdfDoc} title="Círculo"><i className="fas fa-circle" /></button>
        <button className="btn" onClick={() => addShape('line')} disabled={!pdfDoc} title="Línea"><i className="fas fa-minus" /></button>
        <button className="btn" onClick={() => addShape('arrow')} disabled={!pdfDoc} title="Flecha"><i className="fas fa-arrow-right" /></button>
        <button className="btn" onClick={need(() => setShowTableConfig(true))} disabled={!pdfDoc} title="Insertar tabla">
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
