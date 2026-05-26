import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import DeleteButton from './DeleteButton'
import type { HighlightElement } from '../../types'

export default function HighlightElementComp({ element }: { element: HighlightElement }) {
  const selectElement = usePdfStore((s) => s.selectElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const { onMouseDown } = useDrag(element.id)
  const isSelected = selectedId === element.id

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x, top: element.y,
        width: element.w, height: element.h,
        background: element.color,
        opacity: element.opacity,
        cursor: 'move',
        outline: isSelected ? '2px dashed #6c5ce7' : 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => { selectElement(element.id); onMouseDown(e) }}
      onClick={() => selectElement(element.id)}
    >
      {isSelected && <DeleteButton id={element.id} />}
    </div>
  )
}
