import { useRef, useState, useCallback } from 'react'
import { usePdfStore } from '../store/usePdfStore'

export interface CropRect { x: number; y: number; w: number; h: number }

export function useCrop(overlayRef: React.RefObject<HTMLDivElement>) {
  const [cropRect, setCropRect] = useState<CropRect | null>(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const cropCurrentPage = usePdfStore((s) => s.cropCurrentPage)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const addToast = usePdfStore((s) => s.addToast)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return
    const r = overlayRef.current.getBoundingClientRect()
    startPos.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    isDragging.current = true
    setCropRect({ x: startPos.current.x, y: startPos.current.y, w: 0, h: 0 })

    const onMove = (e2: MouseEvent) => {
      if (!isDragging.current || !overlayRef.current) return
      const r2 = overlayRef.current.getBoundingClientRect()
      const cx = e2.clientX - r2.left, cy = e2.clientY - r2.top
      setCropRect({
        x: Math.min(startPos.current.x, cx),
        y: Math.min(startPos.current.y, cy),
        w: Math.abs(cx - startPos.current.x),
        h: Math.abs(cy - startPos.current.y),
      })
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [overlayRef])

  const applyCrop = useCallback(async () => {
    if (!cropRect || cropRect.w < 20 || cropRect.h < 20) return addToast('Área muy pequeña', 'error')
    await cropCurrentPage(cropRect.x, cropRect.y, cropRect.w, cropRect.h)
    setCropRect(null)
    setActiveTool(null)
  }, [cropRect, cropCurrentPage, setActiveTool, addToast])

  const cancelCrop = useCallback(() => {
    setCropRect(null)
    setActiveTool(null)
  }, [setActiveTool])

  return { cropRect, onMouseDown, applyCrop, cancelCrop }
}
