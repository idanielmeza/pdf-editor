import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import { useResize } from '../../hooks/useResize'
import DeleteButton from './DeleteButton'
import type { ImageElement as IEl } from '../../types'

export default function ImageElement({ element }: { element: IEl }) {
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
      <img src={element.src} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} alt="" />
      <div className="resize-handle" onMouseDown={onResizeMouseDown} />
    </div>
  )
}
