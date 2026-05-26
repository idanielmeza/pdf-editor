import { useState, useEffect } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export interface ThumbnailData { pageNum: number; dataUrl: string }

export function useThumbnails(pdfDoc: PDFDocumentProxy | null, totalPages: number) {
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([])

  useEffect(() => {
    if (!pdfDoc) { setThumbnails([]); return }
    let cancelled = false

    async function renderAll() {
      const results: ThumbnailData[] = []
      for (let i = 1; i <= totalPages; i++) {
        if (cancelled) break
        const page = await pdfDoc!.getPage(i)
        const vp = page.getViewport({ scale: 0.4 })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
        results.push({ pageNum: i, dataUrl: canvas.toDataURL() })
      }
      if (!cancelled) setThumbnails(results)
    }
    renderAll()
    return () => { cancelled = true }
  }, [pdfDoc, totalPages])

  return thumbnails
}
