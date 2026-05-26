import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'
import type { OverlayElement } from '../types'
import type { PDFDocumentProxy } from 'pdfjs-dist'

async function urlToBuffer(src: string): Promise<ArrayBuffer> {
  const res = await fetch(src)
  return res.arrayBuffer()
}

interface PdfItem {
  text: string
  x: number
  y: number
  w: number
  h: number           // font size in CSS px at scale 1.5
  fontName: string
  bold: boolean
  italic: boolean
}

interface PdfLine {
  items: PdfItem[]
  y: number
  fontSize: number    // dominant font size
  bold: boolean
}

async function extractPageLines(
  pdfDoc: PDFDocumentProxy,
  pageNum: number
): Promise<PdfLine[]> {
  const page = await pdfDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1.5 })
  const vt = viewport.transform as number[]
  const tc = await page.getTextContent({ includeMarkedContent: false } as any)
  const rawItems = tc.items as any[]

  const items: PdfItem[] = rawItems
    .filter((i) => i.str && i.str.trim())
    .map((i) => {
      const screenX = vt[0] * i.transform[4] + vt[2] * i.transform[5] + vt[4]
      const screenY = vt[1] * i.transform[4] + vt[3] * i.transform[5] + vt[5]
      const fontSize = Math.abs(i.height * Math.abs(vt[3])) || Math.abs(i.transform[3] * Math.abs(vt[3]))
      const fn: string = (i.fontName || '').toLowerCase()
      return {
        text: i.str,
        x: screenX,
        y: screenY,
        w: i.width * Math.abs(vt[0]),
        h: fontSize || 12,
        fontName: i.fontName || 'Arial',
        bold: fn.includes('bold') || fn.includes('heavy') || fn.includes('black'),
        italic: fn.includes('italic') || fn.includes('oblique'),
      }
    })

  // Group by screen Y (±5px tolerance)
  const lineMap = new Map<number, PdfItem[]>()
  for (const item of items) {
    let matched = false
    for (const [ky] of lineMap) {
      if (Math.abs(ky - item.y) < 6) {
        lineMap.get(ky)!.push(item)
        matched = true
        break
      }
    }
    if (!matched) lineMap.set(item.y, [item])
  }

  return [...lineMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, its]) => {
      its.sort((a, b) => a.x - b.x)
      const fontSize = its.reduce((max, i) => Math.max(max, i.h), 0)
      const bold = its.some((i) => i.bold)
      return { items: its, y, fontSize, bold }
    })
}

function cssToHalfPt(cssPx: number): number {
  // CSS px at scale 1.5 → pt: divide by 1.5, then ×(72/96)
  // Word size unit = half-points
  const pt = (cssPx / 1.5) * (72 / 96)
  return Math.max(16, Math.round(pt * 2))
}

export async function exportToWord(
  pdfDoc: PDFDocumentProxy,
  elements: Record<number, OverlayElement[]>,
  totalPages: number,
  fileName: string
): Promise<void> {
  const children: any[] = []

  for (let n = 1; n <= totalPages; n++) {
    if (n > 1) children.push(new Paragraph({ text: '', pageBreakBefore: true }))

    const lines = await extractPageLines(pdfDoc, n)
    const pageEls = elements[n] ?? []

    const whiteouts = pageEls.filter(
      (el) => el.type === 'shape' && (el as any).fillColor === '#ffffff'
    )
    const replacementTexts = pageEls.filter((el) => {
      if (el.type !== 'text') return false
      return whiteouts.some(
        (wo) => Math.abs(wo.y - el.y) < 15 && Math.abs(wo.x - el.x) < 50
      )
    })
    const standaloneTexts = pageEls.filter(
      (el) => el.type === 'text' && !replacementTexts.includes(el)
    )

    // Build content items sorted by Y
    type ContentItem =
      | { kind: 'pdfline'; y: number; line: PdfLine; replacement: any | null }
      | { kind: 'standalone'; y: number; el: any }
      | { kind: 'image'; y: number; el: any }
      | { kind: 'table'; y: number; el: any }

    const contentItems: ContentItem[] = []

    for (const line of lines) {
      const replacement = replacementTexts.find(
        (rt) => Math.abs(rt.y - line.y) < line.fontSize + 5
      ) ?? null
      contentItems.push({ kind: 'pdfline', y: line.y, line, replacement })
    }
    for (const el of standaloneTexts) {
      contentItems.push({ kind: 'standalone', y: (el as any).y, el })
    }
    for (const el of pageEls.filter((e) => e.type === 'image')) {
      contentItems.push({ kind: 'image', y: (el as any).y, el })
    }
    for (const el of pageEls.filter((e) => e.type === 'table')) {
      contentItems.push({ kind: 'table', y: (el as any).y, el })
    }

    contentItems.sort((a, b) => a.y - b.y)

    for (const item of contentItems) {
      if (item.kind === 'pdfline') {
        if (item.replacement) {
          const el = item.replacement as any
          const size = Math.max(16, el.size * 2)
          children.push(new Paragraph({
            children: [new TextRun({ text: el.content, size, font: el.font, bold: false })],
            spacing: { after: 20 },
          }))
        } else {
          // Build runs preserving per-item font/size
          const runs: TextRun[] = []
          for (const it of item.line.items) {
            const halfPt = cssToHalfPt(it.h)
            runs.push(new TextRun({
              text: it.text + (it.text.endsWith(' ') ? '' : ' '),
              size: halfPt,
              bold: it.bold,
              italics: it.italic,
              font: it.fontName.replace(/[,+].*/g, '').trim() || 'Arial',
            }))
          }
          if (runs.length === 0) continue
          children.push(new Paragraph({
            children: runs,
            spacing: { after: 20 },
          }))
        }
      } else if (item.kind === 'standalone') {
        const el = item.el
        children.push(new Paragraph({
          children: [new TextRun({
            text: el.content,
            font: el.font,
            size: Math.max(16, el.size * 2),
            color: el.color.replace('#', ''),
          })],
        }))
      } else if (item.kind === 'image') {
        try {
          const ie = item.el
          const buf = await urlToBuffer(ie.src)
          const isPng = ie.src.startsWith('data:image/png') ||
            (!ie.src.startsWith('data:image/jp') && ie.src.includes('png'))
          // Preserve aspect ratio, cap at 500px wide
          const aspect = ie.h / ie.w
          const w = Math.min(Math.round(ie.w), 500)
          const h = Math.round(w * aspect)
          children.push(new Paragraph({
            children: [new ImageRun({
              data: buf,
              transformation: { width: w, height: h },
              type: isPng ? 'png' : 'jpg',
            })],
          }))
        } catch (e) {
          console.warn('Image export failed', e)
        }
      } else if (item.kind === 'table') {
        const te = item.el
        const rows = te.cells.map((row: string[]) =>
          new TableRow({
            children: row.map((cell: string, ci: number) =>
              new TableCell({
                width: { size: te.colWidths[ci] * 15, type: WidthType.DXA },
                children: [new Paragraph({
                  children: [new TextRun({ text: cell.replace(/<[^>]+>/g, '') })],
                })],
              })
            ),
          })
        )
        children.push(new Table({ rows }))
      }
    }
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.replace('.pdf', '.docx')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
