import { PDFDocument, StandardFonts, rgb, degrees, PDFName, PDFBool } from 'pdf-lib'
import type { OverlayElement } from '../types'

function flipImageVertically(dataUrl: string, w: number, h: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.translate(0, h)
      ctx.scale(1, -1)
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  }
}

export async function savePdfWithOverlays(
  pdfBytes: Uint8Array,
  elements: Record<number, OverlayElement[]>,
  totalPages: number,
  fileName: string,
  zoom: number
): Promise<void> {
  const doc = await PDFDocument.load(pdfBytes)

  // Remove AcroForm fields and all annotations from every page
  try {
    const form = doc.getForm()
    // Access underlying dict to clear field entries
    const acroDict = form.acroForm.dict
    acroDict.set(PDFName.of('NeedAppearances'), PDFBool.False)
    acroDict.delete(PDFName.of('Fields'))
    acroDict.delete(PDFName.of('DR'))
  } catch { /* ignore */ }
  doc.catalog.delete(PDFName.of('AcroForm'))
  const pages = doc.getPages()
  for (const page of pages) {
    page.node.delete(PDFName.of('Annots'))
  }
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const scale = 1.5 * zoom

  for (let n = 1; n <= totalPages; n++) {
    const page = pages[n - 1]
    const { height } = page.getSize()

    for (const el of elements[n] ?? []) {
      if (el.type === 'shape') {
        const stroke = hexToRgb(el.strokeColor)
        const fill = el.fillColor === 'transparent' ? null : hexToRgb(el.fillColor)
        const pdfX = el.x / scale
        const pdfY = height - (el.y + el.h) / scale
        const pdfW = el.w / scale
        const pdfH = el.h / scale

        if (el.shapeType === 'rect') {
          page.drawRectangle({
            x: pdfX, y: pdfY, width: pdfW, height: pdfH,
            ...(fill ? { color: rgb(fill.r, fill.g, fill.b) } : {}),
            ...(el.strokeWidth > 0 ? {
              borderColor: rgb(stroke.r, stroke.g, stroke.b),
              borderWidth: el.strokeWidth / scale,
            } : {}),
          })
        } else if (el.shapeType === 'circle') {
          page.drawEllipse({
            x: pdfX + pdfW / 2, y: pdfY + pdfH / 2,
            xScale: pdfW / 2, yScale: pdfH / 2,
            borderColor: rgb(stroke.r, stroke.g, stroke.b),
            borderWidth: el.strokeWidth / scale,
            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
          })
        } else if (el.shapeType === 'line' || el.shapeType === 'arrow') {
          page.drawLine({
            start: { x: pdfX, y: pdfY + pdfH / 2 },
            end: { x: pdfX + pdfW, y: pdfY + pdfH / 2 },
            color: rgb(stroke.r, stroke.g, stroke.b),
            thickness: el.strokeWidth / scale,
          })
        }
      } else if (el.type === 'text') {
        const { r, g, b } = hexToRgb(el.color)
        page.drawText(el.content || '', {
          x: el.x / scale,
          y: height - (el.y + el.size) / scale,
          size: el.size / scale,
          font,
          color: rgb(r, g, b),
        })
      } else if (el.type === 'highlight') {
        const { r, g, b } = hexToRgb(el.color)
        page.drawRectangle({
          x: el.x / scale,
          y: height - (el.y + el.h) / scale,
          width: el.w / scale,
          height: el.h / scale,
          color: rgb(r, g, b),
          opacity: el.opacity,
        })
      } else if (el.type === 'image' || el.type === 'drawing') {
        // For drawing/eraser elements stored as data URLs, flip vertically via canvas
        // because canvas Y=0 is top but PDF Y=0 is bottom
        let srcUrl = el.src
        if (el.type === 'drawing') {
          srcUrl = await flipImageVertically(el.src, el.w, el.h)
        }
        const imgBytes = await fetch(srcUrl).then((r) => r.arrayBuffer())
        const isPng = srcUrl.startsWith('data:image/png') || (!srcUrl.startsWith('data:image/jp') && srcUrl.includes('png'))
        const img = isPng
          ? await doc.embedPng(imgBytes)
          : await doc.embedJpg(imgBytes)
        const pdfX = el.x / scale
        const pdfY = height - (el.y + el.h) / scale
        const pdfW = el.w / scale
        const pdfH = el.h / scale
        page.drawImage(img, {
          x: pdfX, y: pdfY,
          width: pdfW, height: pdfH,
        })
      }
    }
  }

  const bytes = await doc.save({ useObjectStreams: false })
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.replace('.pdf', '_editado.pdf')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
