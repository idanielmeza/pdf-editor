import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import TextElement from './TextElement'
import ImageElement from './ImageElement'
import ShapeElement from './ShapeElement'
import TableElement from './TableElement'

export default function EditOverlay() {
  const elements = usePdfStore((s) => s.elements)
  const currentPage = usePdfStore((s) => s.currentPage)
  const activeTool = usePdfStore((s) => s.activeTool)
  const addElement = usePdfStore((s) => s.addElement)
  const selectElement = usePdfStore((s) => s.selectElement)
  const viewportRef = usePdfStore((s) => s.viewportRef)
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
    // Deselect on click on empty area
    selectElement(null)
    if (dx > 5 || dy > 5) return
    // Only create text element if text tool active
    if (activeTool !== 'text') return
    const rect = e.currentTarget.getBoundingClientRect()
    addElement({
      type: 'text', id: crypto.randomUUID(),
      x: e.clientX - rect.left, y: e.clientY - rect.top,
      content: 'Texto', font: 'Inter', size: 16, color: '#000000',
    })
  }

  const pageElements = elements[currentPage] ?? []

  return (
    <div
      className={`edit-overlay ${activeTool === 'text' ? 'active' : ''}`}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: viewportRef?.width, height: viewportRef?.height,
        // 'auto' only when text tool active (needs to capture clicks for new elements)
        // otherwise 'none' so TextLayer stays clickable — child elements have their own pointerEvents
        pointerEvents: activeTool === 'text' ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {pageElements.map((el) => {
        if (el.type === 'text') return <TextElement key={el.id} element={el} />
        if (el.type === 'image') return <ImageElement key={el.id} element={el} />
        if (el.type === 'shape') return <ShapeElement key={el.id} element={el} />
        if (el.type === 'table') return <TableElement key={el.id} element={el} />
        return null
      })}
    </div>
  )
}
