import { useRef, useEffect } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import DeleteButton from './DeleteButton'
import type { TextElement as TEl } from '../../types'

export default function TextElement({ element }: { element: TEl }) {
  const selectElement = usePdfStore((s) => s.selectElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const updateElement = usePdfStore((s) => s.updateElement)
  const { onMouseDown } = useDrag(element.id)
  const isEditing = useRef(false)
  const divRef = useRef<HTMLDivElement>(null)

  // Only sync content from store when NOT editing (avoids caret jump)
  useEffect(() => {
    if (!isEditing.current && divRef.current) {
      divRef.current.textContent = element.content
    }
  }, [element.content])

  function handleMouseDown(e: React.MouseEvent) {
    selectElement(element.id)
    if (!isEditing.current) {
      onMouseDown(e)
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    isEditing.current = true
    const el = divRef.current
    if (!el) return
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  function handleBlur() {
    isEditing.current = false
    if (divRef.current) {
      updateElement(element.id, { content: divRef.current.textContent ?? '' })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      isEditing.current = false
      divRef.current?.blur()
    }
    e.stopPropagation() // prevent Delete key from deleting element while typing
  }

  const isSelected = selectedId === element.id

  return (
    <div style={{ position: 'absolute', left: element.x, top: element.y, pointerEvents: 'auto' }}>
      {isSelected && <DeleteButton id={element.id} />}
      <div
        ref={divRef}
        className={`text-element ${isSelected ? 'selected' : ''}`}
        style={{
          fontFamily: element.font,
          fontSize: element.size,
          color: element.color,
          position: 'relative',
          cursor: 'move',
          minWidth: 20,
          minHeight: element.size + 4,
          padding: '2px 4px',
          outline: 'none',
        }}
        contentEditable
        suppressContentEditableWarning
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
