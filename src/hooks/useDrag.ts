import { useCallback } from 'react'
import { usePdfStore } from '../store/usePdfStore'

export function useDrag(id: string) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const elements = usePdfStore((s) => s.elements)
  const currentPage = usePdfStore((s) => s.currentPage)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const el = elements[currentPage]?.find((el) => el.id === id)
      if (!el) return
      const startX = e.clientX, startY = e.clientY
      const origX = el.x, origY = el.y

      const onMove = (e2: MouseEvent) => {
        updateElement(id, { x: origX + (e2.clientX - startX), y: origY + (e2.clientY - startY) })
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [id, elements, currentPage, updateElement]
  )

  return { onMouseDown }
}
