import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist'
import type { PDFDocument } from 'pdf-lib'

export type ToolName = 'text' | 'crop' | 'draw' | null

export interface TextElement {
  type: 'text'
  id: string
  x: number
  y: number
  content: string
  font: string
  size: number
  color: string
}

export interface ImageElement {
  type: 'image'
  id: string
  x: number
  y: number
  w: number
  h: number
  src: string
}

export type ShapeType = 'rect' | 'circle' | 'line' | 'arrow'

export interface ShapeElement {
  type: 'shape'
  id: string
  shapeType: ShapeType
  x: number
  y: number
  w: number
  h: number
  strokeColor: string
  fillColor: string
  strokeWidth: number
}

export interface TableElement {
  type: 'table'
  id: string
  x: number
  y: number
  rows: number
  cols: number
  colWidths: number[]
  rowHeights: number[]
  cells: string[][]  // [row][col]
  borderColor: string
  headerBg: string
  fontSize: number
}

export interface DrawingElement {
  type: 'drawing'
  id: string
  x: number
  y: number
  w: number
  h: number
  src: string  // data URL of the drawing canvas
}

export type OverlayElement = TextElement | ImageElement | ShapeElement | TableElement | DrawingElement

export interface OcrLine {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export interface OcrData {
  lines: OcrLine[]
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface PdfViewport {
  width: number
  height: number
  scale: number
}

export type { PDFDocumentProxy, PDFDocument, PageViewport }
