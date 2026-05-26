import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import type { PDFDocumentProxy } from 'pdfjs-dist'

// Use CDN worker to avoid Vite bundling issues with pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export interface LoadedPdf {
  pdfDoc: PDFDocumentProxy
  pdfLibDoc: PDFDocument
  pdfBytes: Uint8Array
  totalPages: number
}

export async function loadPdfFile(file: File): Promise<LoadedPdf> {
  const buf = await file.arrayBuffer()
  const pdfBytes = new Uint8Array(buf)
  const [pdfDoc, pdfLibDoc] = await Promise.all([
    pdfjsLib.getDocument({ data: buf.slice(0) }).promise,
    PDFDocument.load(pdfBytes),
  ])
  return { pdfDoc, pdfLibDoc, pdfBytes, totalPages: pdfDoc.numPages }
}

export async function refreshFromLibDoc(
  pdfLibDoc: PDFDocument
): Promise<{ pdfDoc: PDFDocumentProxy; pdfBytes: Uint8Array }> {
  const pdfBytes = await pdfLibDoc.save()
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise
  return { pdfDoc, pdfBytes }
}
