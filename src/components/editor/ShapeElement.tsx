import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import { useResize } from '../../hooks/useResize'
import DeleteButton from './DeleteButton'
import type { ShapeElement as SEl } from '../../types'

function renderShape(el: SEl) {
  const { w, h, shapeType, strokeColor, fillColor, strokeWidth } = el
  if (shapeType === 'rect') {
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <rect x={strokeWidth/2} y={strokeWidth/2} width={w - strokeWidth} height={h - strokeWidth}
          fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      </svg>
    )
  }
  if (shapeType === 'circle') {
    const rx = (w - strokeWidth) / 2, ry = (h - strokeWidth) / 2
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <ellipse cx={w/2} cy={h/2} rx={rx} ry={ry}
          fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      </svg>
    )
  }
  if (shapeType === 'line') {
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <line x1={0} y1={h/2} x2={w} y2={h/2}
          stroke={strokeColor} strokeWidth={strokeWidth} />
      </svg>
    )
  }
  if (shapeType === 'arrow') {
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <marker id={`arrow-${el.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
          </marker>
        </defs>
        <line x1={0} y1={h/2} x2={w - 10} y2={h/2}
          stroke={strokeColor} strokeWidth={strokeWidth}
          markerEnd={`url(#arrow-${el.id})`} />
      </svg>
    )
  }
  return null
}

export default function ShapeElement({ element }: { element: SEl }) {
  const selectElement = usePdfStore((s) => s.selectElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const { onMouseDown } = useDrag(element.id)
  const { onResizeMouseDown } = useResize(element.id)
  const isSelected = selectedId === element.id

  return (
    <div
      className={`image-element ${isSelected ? 'selected' : ''}`}
      style={{ left: element.x, top: element.y, width: element.w, height: element.h, position: 'absolute' }}
      onMouseDown={(e) => { selectElement(element.id); onMouseDown(e) }}
      onClick={() => selectElement(element.id)}
    >
      {isSelected && <DeleteButton id={element.id} />}
      {renderShape(element)}
      <div className="resize-handle" onMouseDown={onResizeMouseDown} />
    </div>
  )
}
