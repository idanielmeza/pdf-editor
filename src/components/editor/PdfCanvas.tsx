import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { usePdfRenderer } from '../../hooks/usePdfRenderer'

export default function PdfCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const currentPage = usePdfStore((s) => s.currentPage)
  const zoom = usePdfStore((s) => s.zoom)

  usePdfRenderer(canvasRef, pdfDoc, currentPage, zoom)

  return <canvas ref={canvasRef} id="pdf-canvas" />
}
