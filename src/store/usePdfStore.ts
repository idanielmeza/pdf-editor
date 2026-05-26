import { create } from 'zustand'
import { loadPdfFile, refreshFromLibDoc } from '../services/pdfLoader'
import { savePdfWithOverlays } from '../services/pdfSaver'
import { addBlankPage, duplicatePageInDoc, deletePageFromDoc, rotatePageInDoc, cropPageInDoc } from '../services/pageOps'
import { runOcrOnCanvas } from '../services/ocrService'
import { t } from './useI18nStore'
import type { OverlayElement, OcrData, Toast, ToolName } from '../types'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { PDFDocument } from 'pdf-lib'

interface PdfStore {
  pdfDoc: PDFDocumentProxy | null
  pdfLibDoc: PDFDocument | null
  pdfBytes: Uint8Array | null
  fileName: string
  currentPage: number
  totalPages: number
  zoom: number
  elements: Record<number, OverlayElement[]>
  elementHistory: Record<number, OverlayElement[]>[]
  historyIndex: number
  selectedId: string | null
  activeTool: ToolName
  ocrData: Record<number, OcrData>
  ocrProgress: number
  ocrActive: boolean
  toasts: Toast[]
  viewportRef: { width: number; height: number } | null
  drawColor: string
  drawSize: number
  eraserSize: number
  eraserColor: string
  setDrawColor: (c: string) => void
  setDrawSize: (s: number) => void
  setEraserSize: (s: number) => void
  setEraserColor: (c: string) => void

  loadPdf: (file: File) => Promise<void>
  savePdf: () => Promise<void>
  refreshLibDoc: () => Promise<void>
  goToPage: (n: number) => void
  setZoom: (z: number) => void
  addElement: (el: OverlayElement) => void
  updateElement: (id: string, patch: Partial<OverlayElement>, pushToHistory?: boolean) => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  setActiveTool: (tool: ToolName) => void
  addPage: () => Promise<void>
  duplicatePage: () => Promise<void>
  deletePage: (n: number) => Promise<void>
  rotateCurrentPage: () => Promise<void>
  cropCurrentPage: (x: number, y: number, w: number, h: number) => Promise<void>
  runOcr: (pageNum: number, canvas: HTMLCanvasElement) => Promise<void>
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
  setViewport: (vp: { width: number; height: number } | null) => void
  mergePdf: (file: File) => Promise<void>
  exportWord: () => Promise<void>
  undo: () => void
  redo: () => void
  pushHistory: (elements: Record<number, OverlayElement[]>) => void
}

export const usePdfStore = create<PdfStore>((set, get) => ({
  pdfDoc: null,
  pdfLibDoc: null,
  pdfBytes: null,
  fileName: '',
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  elements: {},
  elementHistory: [],
  historyIndex: -1,
  selectedId: null,
  drawColor: '#000000',
  drawSize: 3,
  eraserSize: 20,
  eraserColor: '#ffffff',
  setDrawColor: (c) => set({ drawColor: c }),
  setDrawSize: (s) => set({ drawSize: s }),
  setEraserSize: (s) => set({ eraserSize: s }),
  setEraserColor: (c) => set({ eraserColor: c }),
  activeTool: null,
  ocrData: {},
  ocrProgress: 0,
  ocrActive: false,
  toasts: [],
  viewportRef: null,

  loadPdf: async (file) => {
    get().addToast(t('toastLoading'), 'info')
    try {
      const { pdfDoc, pdfLibDoc, pdfBytes, totalPages } = await loadPdfFile(file)
      const elements: Record<number, OverlayElement[]> = {}
      for (let i = 1; i <= totalPages; i++) elements[i] = []
      set({
        pdfDoc, pdfLibDoc, pdfBytes, totalPages,
        fileName: file.name, currentPage: 1,
        elements, ocrData: {},
        elementHistory: [JSON.parse(JSON.stringify(elements))],
        historyIndex: 0,
      })
      get().addToast(t('toastLoaded'), 'success')
    } catch (e: any) {
      get().addToast(t('toastLoadError') + e.message, 'error')
    }
  },

  savePdf: async () => {
    const { pdfBytes, elements, totalPages, fileName, zoom } = get()
    if (!pdfBytes) return get().addToast(t('toastNothingToSave'), 'error')
    get().addToast(t('toastSaving'), 'info')
    try {
      await savePdfWithOverlays(pdfBytes, elements, totalPages, fileName, zoom)
      get().addToast(t('toastSaved'), 'success')
    } catch (e: any) {
      get().addToast(t('toastSaveError') + e.message, 'error')
    }
  },

  refreshLibDoc: async () => {
    const { pdfLibDoc } = get()
    if (!pdfLibDoc) return
    const { pdfDoc, pdfBytes } = await refreshFromLibDoc(pdfLibDoc)
    set({ pdfDoc, pdfBytes, totalPages: pdfDoc.numPages })
  },

  goToPage: (n) => {
    const { totalPages } = get()
    if (!n || n < 1 || n > totalPages) return
    set({ currentPage: n, selectedId: null })
  },

  setZoom: (z) => set({ zoom: Math.min(3, Math.max(0.25, z)) }),

  pushHistory: (elements) => {
    const { elementHistory, historyIndex } = get()
    const trimmed = elementHistory.slice(0, historyIndex + 1)
    const next = [...trimmed, JSON.parse(JSON.stringify(elements))].slice(-50)
    set({ elementHistory: next, historyIndex: next.length - 1 })
  },

  addElement: (el) => {
    const { elements, currentPage } = get()
    const next = { ...elements, [currentPage]: [...(elements[currentPage] ?? []), el] }
    get().pushHistory(next)
    set({ elements: next })
  },

  updateElement: (id, patch, pushToHistory = false) => {
    const { elements, currentPage } = get()
    const next = {
      ...elements,
      [currentPage]: elements[currentPage].map((el) =>
        el.id === id ? ({ ...el, ...patch } as OverlayElement) : el
      ),
    }
    if (pushToHistory) get().pushHistory(next)
    set({ elements: next })
  },

  deleteElement: (id) => {
    const { elements, currentPage } = get()
    const next = {
      ...elements,
      [currentPage]: elements[currentPage].filter((el) => el.id !== id),
    }
    get().pushHistory(next)
    set({ elements: next, selectedId: null })
  },

  undo: () => {
    const { elementHistory, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    set({ elements: JSON.parse(JSON.stringify(elementHistory[prev])), historyIndex: prev, selectedId: null })
  },

  redo: () => {
    const { elementHistory, historyIndex } = get()
    if (historyIndex >= elementHistory.length - 1) return
    const next = historyIndex + 1
    set({ elements: JSON.parse(JSON.stringify(elementHistory[next])), historyIndex: next, selectedId: null })
  },

  selectElement: (id) => set({ selectedId: id }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  addPage: async () => {
    const { pdfLibDoc } = get()
    if (!pdfLibDoc) return
    await addBlankPage(pdfLibDoc)
    await get().refreshLibDoc()
    const { totalPages, elements } = get()
    set({ elements: { ...elements, [totalPages]: [] } })
    get().goToPage(totalPages)
    get().addToast(t('toastPageAdded'), 'success')
  },

  duplicatePage: async () => {
    const { pdfLibDoc, currentPage, elements } = get()
    if (!pdfLibDoc) return
    await duplicatePageInDoc(pdfLibDoc, currentPage - 1)
    await get().refreshLibDoc()
    const { totalPages } = get()
    const newElements: Record<number, OverlayElement[]> = {}
    for (let i = 1; i <= totalPages; i++) {
      if (i <= currentPage) newElements[i] = elements[i] ?? []
      else if (i === currentPage + 1) newElements[i] = JSON.parse(JSON.stringify(elements[currentPage] ?? []))
      else newElements[i] = elements[i - 1] ?? []
    }
    set({ elements: newElements })
    get().addToast(t('toastDuplicated'), 'success')
  },

  deletePage: async (n) => {
    const { pdfLibDoc, totalPages, elements, currentPage } = get()
    if (!pdfLibDoc || totalPages <= 1) return get().addToast(t('toastCantDeleteLast'), 'error')
    deletePageFromDoc(pdfLibDoc, n - 1)
    await get().refreshLibDoc()
    const { totalPages: newTotal } = get()
    const newElements: Record<number, OverlayElement[]> = {}
    for (let i = 1; i <= newTotal; i++) newElements[i] = i < n ? elements[i] ?? [] : elements[i + 1] ?? []
    const nextPage = currentPage > newTotal ? newTotal : currentPage
    set({ elements: newElements })
    get().goToPage(nextPage)
    get().addToast(t('toastDeleted'), 'success')
  },

  rotateCurrentPage: async () => {
    const { pdfLibDoc, currentPage } = get()
    if (!pdfLibDoc) return
    rotatePageInDoc(pdfLibDoc, currentPage - 1)
    await get().refreshLibDoc()
    get().addToast(t('toastRotated'), 'success')
  },

  cropCurrentPage: async (x, y, w, h) => {
    const { pdfLibDoc, currentPage } = get()
    if (!pdfLibDoc) return
    cropPageInDoc(pdfLibDoc, currentPage - 1, x, y, w, h)
    await get().refreshLibDoc()
    get().addToast(t('toastCropped'), 'success')
  },

  runOcr: async (pageNum, canvas) => {
    set({ ocrActive: true, ocrProgress: 0 })
    try {
      const ocrData = await runOcrOnCanvas(canvas, (pct) => set({ ocrProgress: pct }))
      const { ocrData: existing } = get()
      set({ ocrData: { ...existing, [pageNum]: ocrData }, ocrActive: false })
      get().addToast(t('toastOcrDone'), 'success')
    } catch {
      set({ ocrActive: false })
      get().addToast(t('toastOcrError'), 'error')
    }
  },

  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setViewport: (vp) => set({ viewportRef: vp }),

  mergePdf: async (file) => {
    const { pdfLibDoc, elements, totalPages } = get()
    if (!pdfLibDoc) return get().addToast(t('toastMergeFirst'), 'error')
    get().addToast(t('toastMerging'), 'info')
    try {
      const { mergePdfIntoDoc } = await import('../services/pageOps')
      await mergePdfIntoDoc(pdfLibDoc, file)
      await get().refreshLibDoc()
      const { totalPages: newTotal } = get()
      const newElements = { ...elements }
      for (let i = totalPages + 1; i <= newTotal; i++) newElements[i] = []
      set({ elements: newElements })
      get().addToast(`${t('toastMerged')} (${newTotal} ${t('pages').toLowerCase()})`, 'success')
    } catch (e: any) {
      get().addToast(t('toastMergeError') + e.message, 'error')
    }
  },

  exportWord: async () => {
    const { pdfDoc, elements, totalPages, fileName } = get()
    if (!pdfDoc || !totalPages) return get().addToast(t('toastNothingExport'), 'error')
    get().addToast(t('toastExporting'), 'info')
    try {
      const { exportToWord } = await import('../services/wordExporter')
      await exportToWord(pdfDoc, elements, totalPages, fileName || 'documento.pdf')
      get().addToast(t('toastExported'), 'success')
    } catch (e: any) {
      get().addToast(t('toastExportError') + e.message, 'error')
    }
  },
}))
