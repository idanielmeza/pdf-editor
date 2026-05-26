import { useEffect, useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import UploadZone from './UploadZone'
import PageWrapper from './PageWrapper'

export default function EditorArea() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const viewportRef = usePdfStore((s) => s.viewportRef)
  const setZoom = usePdfStore((s) => s.setZoom)
  const zoom = usePdfStore((s) => s.zoom)
  const containerRef = useRef<HTMLDivElement>(null)
  const fitted = useRef(false)

  // Auto-fit zoom to container width on mobile after first render
  useEffect(() => {
    if (!pdfDoc || !containerRef.current || !viewportRef) return
    if (window.innerWidth > 768) return
    if (fitted.current) return
    fitted.current = true
    const containerW = containerRef.current.clientWidth - 8
    const pageNaturalW = viewportRef.width / zoom
    const fitZoom = containerW / pageNaturalW
    if (Math.abs(fitZoom - zoom) > 0.05) {
      setZoom(Math.max(0.25, fitZoom))
    }
  }, [pdfDoc, viewportRef, zoom, setZoom])

  // Reset fit flag when PDF changes
  useEffect(() => { fitted.current = false }, [pdfDoc])

  return (
    <main className="editor-area" ref={containerRef}>
      {!pdfDoc ? <UploadZone /> : <PageWrapper />}
    </main>
  )
}
