import { PDFDocument, degrees } from 'pdf-lib'

export async function addBlankPage(doc: PDFDocument): Promise<PDFDocument> {
  doc.addPage()
  return doc
}

export async function duplicatePageInDoc(
  doc: PDFDocument,
  pageIndex: number
): Promise<PDFDocument> {
  const [copied] = await doc.copyPages(doc, [pageIndex])
  doc.insertPage(pageIndex + 1, copied)
  return doc
}

export function deletePageFromDoc(doc: PDFDocument, pageIndex: number): PDFDocument {
  doc.removePage(pageIndex)
  return doc
}

export function rotatePageInDoc(doc: PDFDocument, pageIndex: number): PDFDocument {
  const page = doc.getPages()[pageIndex]
  page.setRotation(degrees((page.getRotation().angle + 90) % 360))
  return doc
}

export function cropPageInDoc(
  doc: PDFDocument,
  pageIndex: number,
  x: number,
  y: number,
  w: number,
  h: number
): PDFDocument {
  const page = doc.getPages()[pageIndex]
  const { height } = page.getSize()
  page.setMediaBox(x, height - y - h, w, h)
  page.setCropBox(x, height - y - h, w, h)
  return doc
}

export async function mergePdfIntoDoc(
  targetDoc: PDFDocument,
  fileToMerge: File
): Promise<PDFDocument> {
  const buf = await fileToMerge.arrayBuffer()
  const srcDoc = await PDFDocument.load(buf)
  const pageIndices = srcDoc.getPageIndices()
  const copiedPages = await targetDoc.copyPages(srcDoc, pageIndices)
  copiedPages.forEach((page) => targetDoc.addPage(page))
  return targetDoc
}
