import { useEffect } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { usePdfStore } from '../store/usePdfStore'

export function usePdfRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  pdfDoc: PDFDocumentProxy | null,
  currentPage: number,
  zoom: number,
  onViewport?: (vp: { width: number; height: number }) => void
) {
  const setViewport = usePdfStore((s) => s.setViewport)

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return
    let cancelled = false

    async function render() {
      const page = await pdfDoc!.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1.5 * zoom })
      if (cancelled || !canvasRef.current) return
      const canvas = canvasRef.current
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
      if (!cancelled) {
        setViewport({ width: viewport.width, height: viewport.height })
        onViewport?.({ width: viewport.width, height: viewport.height })
      }
    }
    render()
    return () => { cancelled = true }
  }, [pdfDoc, currentPage, zoom, canvasRef, setViewport, onViewport])
}
