import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import DeleteButton from './DeleteButton'
import type { DrawingElement } from '../../types'

export default function DrawingElementComp({ element }: { element: DrawingElement }) {
  const selectElement = usePdfStore((s) => s.selectElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const { onMouseDown } = useDrag(element.id)
  const isSelected = selectedId === element.id

  return (
    <div
      style={{ position: 'absolute', left: element.x, top: element.y, pointerEvents: 'auto' }}
      onClick={() => selectElement(element.id)}
    >
      {isSelected && <DeleteButton id={element.id} />}
      <div
        className={`image-element ${isSelected ? 'selected' : ''}`}
        style={{ width: element.w, height: element.h, cursor: 'move' }}
        onMouseDown={(e) => { selectElement(element.id); onMouseDown(e) }}
      >
        <img
          src={element.src}
          width={element.w}
          height={element.h}
          style={{ display: 'block', pointerEvents: 'none' }}
          draggable={false}
        />
      </div>
    </div>
  )
}
