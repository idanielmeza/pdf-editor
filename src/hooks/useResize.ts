import { useCallback } from 'react'
import { usePdfStore } from '../store/usePdfStore'

export function useResize(id: string) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const elements = usePdfStore((s) => s.elements)
  const currentPage = usePdfStore((s) => s.currentPage)

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const el = elements[currentPage]?.find((el) => el.id === id)
      if (!el || el.type !== 'image') return
      const startX = e.clientX, startY = e.clientY
      const origW = el.w, origH = el.h

      const onMove = (e2: MouseEvent) => {
        updateElement(id, {
          w: Math.max(50, origW + (e2.clientX - startX)),
          h: Math.max(50, origH + (e2.clientY - startY)),
        })
      }
      const onUp = (e2: MouseEvent) => {
        updateElement(id, {
          w: Math.max(50, origW + (e2.clientX - startX)),
          h: Math.max(50, origH + (e2.clientY - startY)),
        }, true)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [id, elements, currentPage, updateElement]
  )

  return { onResizeMouseDown }
}
