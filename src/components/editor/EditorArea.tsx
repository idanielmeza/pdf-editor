import { useEffect, useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import UploadZone from './UploadZone'
import PageWrapper from './PageWrapper'

export default function EditorArea() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const viewportRef = usePdfStore((s) => s.viewportRef)
  const setZoom = usePdfStore((s) => s.setZoom)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFitZoom = useRef<number | null>(null)
  const lastPinchDist = useRef<number | null>(null)

  // Auto-fit PDF to container width on mobile (first load only)
  useEffect(() => {
    if (!pdfDoc || !viewportRef || !containerRef.current) return
    if (window.innerWidth > 768) return

    const containerW = containerRef.current.clientWidth
    if (containerW < 50) return

    const currentZoom = usePdfStore.getState().zoom
    const pageNaturalW = viewportRef.width / currentZoom
    const fitZoom = Math.max(0.25, Math.min((containerW - 4) / pageNaturalW, 3))

    if (lastFitZoom.current !== null && Math.abs(fitZoom - lastFitZoom.current) < 0.02) return
    lastFitZoom.current = fitZoom
    setZoom(fitZoom)
  }, [pdfDoc, viewportRef, setZoom])

  useEffect(() => { lastFitZoom.current = null }, [pdfDoc])

  // Pinch-to-zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      if (lastPinchDist.current === null) { lastPinchDist.current = dist; return }
      const scale = dist / lastPinchDist.current
      lastPinchDist.current = dist
      const current = usePdfStore.getState().zoom
      usePdfStore.getState().setZoom(Math.max(0.25, Math.min(current * scale, 3)))
    }

    function onTouchEnd() { lastPinchDist.current = null }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <main className="editor-area" ref={containerRef}>
      {!pdfDoc ? <UploadZone /> : <PageWrapper />}
    </main>
  )
}
