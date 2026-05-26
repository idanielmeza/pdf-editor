import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import TextElement from './TextElement'
import ImageElement from './ImageElement'
import ShapeElement from './ShapeElement'
import TableElement from './TableElement'
import DrawingElementComp from './DrawingElementComp'
import DrawingCanvas from './DrawingCanvas'
import EraserCanvas from './EraserCanvas'

export default function EditOverlay() {
  const elements = usePdfStore((s) => s.elements)
  const currentPage = usePdfStore((s) => s.currentPage)
  const activeTool = usePdfStore((s) => s.activeTool)
  const addElement = usePdfStore((s) => s.addElement)
  const selectElement = usePdfStore((s) => s.selectElement)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const viewportRef = usePdfStore((s) => s.viewportRef)
  const drawColor = usePdfStore((s) => s.drawColor)
  const drawSize = usePdfStore((s) => s.drawSize)
  const eraserSize = usePdfStore((s) => s.eraserSize)
  const eraserColor = usePdfStore((s) => s.eraserColor)
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement) !== e.currentTarget) return
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement) !== e.currentTarget) return
    if (!mouseDownPos.current) return
    const dx = Math.abs(e.clientX - mouseDownPos.current.x)
    const dy = Math.abs(e.clientY - mouseDownPos.current.y)
    mouseDownPos.current = null
    selectElement(null)
    if (dx > 5 || dy > 5) return
    if (activeTool !== 'text') return
    const rect = e.currentTarget.getBoundingClientRect()
    addElement({
      type: 'text', id: crypto.randomUUID(),
      x: e.clientX - rect.left, y: e.clientY - rect.top,
      content: 'Texto', font: 'Inter', size: 16, color: '#000000',
    })
  }

  const pageElements = elements[currentPage] ?? []
  const isDrawing = activeTool === 'draw'

  return (
    <div
      className={`edit-overlay ${activeTool === 'text' ? 'active' : ''}`}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: viewportRef?.width, height: viewportRef?.height,
        pointerEvents: (activeTool === 'text' || activeTool === 'draw' || activeTool === 'eraser') ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {pageElements.map((el) => {
        if (el.type === 'text') return <TextElement key={el.id} element={el} />
        if (el.type === 'image') return <ImageElement key={el.id} element={el} />
        if (el.type === 'shape') return <ShapeElement key={el.id} element={el} />
        if (el.type === 'table') return <TableElement key={el.id} element={el} />
        if (el.type === 'drawing') return <DrawingElementComp key={el.id} element={el} />
        return null
      })}

      {isDrawing && viewportRef && (
        <DrawingCanvas
          width={viewportRef.width}
          height={viewportRef.height}
          color={drawColor}
          size={drawSize}
          onCommit={() => setActiveTool(null)}
        />
      )}

      {activeTool === 'eraser' && viewportRef && (
        <EraserCanvas
          width={viewportRef.width}
          height={viewportRef.height}
          size={eraserSize}
          color={eraserColor}
        />
      )}
    </div>
  )
}
