# PDF Editor Pro — Documentation

## Project Overview

PDF Editor Pro is a browser-based PDF editing application built with React, Vite, and TypeScript. It allows users to open PDF files, add/edit text overlays, insert images, run OCR, manage pages (add, duplicate, delete, rotate, crop), and save the result as a new PDF.

The application uses:
- **pdfjs-dist** for rendering PDF pages to canvas
- **pdf-lib** for mutating the PDF document (page operations, saving)
- **tesseract.js** for OCR processing
- **Zustand** for all global state management
- **React 18** with function components and hooks throughout

---

## Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                          index.html                             │
│                         src/main.tsx                            │
│                          src/App.tsx                            │
│                    (useKeyboardShortcuts)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     AppLayout       │
              │  layout/AppLayout   │
              └──┬──────┬───────┬───┘
                 │      │       │
        ┌────────▼─┐  ┌─▼────┐ ┌▼──────────────┐
        │ Header   │  │Editor│ │PropertiesPanel │
        │ Toolbar  │  │ Area │ │  panels/       │
        └──────────┘  └──┬───┘ └───────────────┘
                         │
              ┌──────────▼──────────┐
              │    PageWrapper      │
              │  ┌───────────────┐  │
              │  │  PdfCanvas    │  │
              │  │  TextLayer    │  │
              │  │  EditOverlay  │  │
              │  │  CropOverlay  │  │
              │  └───────────────┘  │
              └─────────────────────┘

         ┌─────────────────────────────────┐
         │         Zustand Store           │
         │         usePdfStore             │
         │                                 │
         │  state: pdfDoc, pdfLibDoc,      │
         │  pdfBytes, currentPage, zoom,   │
         │  elements, selectedId,          │
         │  activeTool, ocrData, toasts    │
         │                                 │
         │  actions: loadPdf, savePdf,     │
         │  goToPage, setZoom, addElement, │
         │  updateElement, deleteElement,  │
         │  addPage, duplicatePage,        │
         │  deletePage, rotateCurrentPage, │
         │  cropCurrentPage, runOcr        │
         └────────────┬────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │          Services          │
        │  pdfLoader  pdfSaver       │
        │  ocrService pageOps        │
        └────────────────────────────┘
```

---

## Feature List

### File Operations
- Open PDF via file picker or drag-and-drop
- Save edited PDF with all overlays baked in (downloads as `*_editado.pdf`)
- Ctrl+S keyboard shortcut to save

### Text Editing
- Add text overlays anywhere on a page (click with Text tool active)
- Inline editing of text (contentEditable)
- Drag text elements freely
- Change font family (Inter, Arial, Georgia)
- Change font size
- Change text color via color picker
- Delete selected text element (Delete key or button)

### Image Editing
- Insert images (JPG/PNG) from local disk
- Drag images freely on the page
- Resize images from bottom-right corner handle
- Change width/height numerically in properties panel
- Delete images

### Page Management
- Add blank pages
- Duplicate current page (with its overlays)
- Delete any page (guarded: cannot delete last page)
- Rotate current page 90° clockwise
- Crop current page by drawing a selection rectangle

### Navigation & View
- Thumbnail sidebar showing all pages
- Click thumbnail to navigate
- Delete page from sidebar thumbnail
- Page navigation bar (prev/next arrows, direct page number input)
- Zoom in/out (25% - 300%), zoom indicator

### OCR
- Run Tesseract.js OCR on the current page canvas
- Progress bar overlay while processing
- Results stored per page in store

### UX
- Toast notifications (success, error, info) with auto-dismiss
- Keyboard shortcuts: Delete/Backspace to delete selected element, Escape to deselect/cancel tool
- Dark theme throughout

---

## How to Add New Features

### Example: Adding a Draw / Highlight Tool

This example walks through adding a freehand highlighter tool end-to-end.

#### Step 1 — Add the type

In `src/types/index.ts`, add a new element type:

```typescript
export interface DrawElement {
  type: 'draw'
  id: string
  points: Array<{ x: number; y: number }>
  color: string
  width: number
}

// Update the union:
export type OverlayElement = TextElement | ImageElement | DrawElement
```

#### Step 2 — Add the tool name

In `src/types/index.ts`:

```typescript
export type ToolName = 'text' | 'crop' | 'draw' | null
```

#### Step 3 — Create the hook

Create `src/hooks/useDraw.ts`:

```typescript
import { useRef, useCallback } from 'react'
import { usePdfStore } from '../store/usePdfStore'
import type { DrawElement } from '../types'

export function useDraw(canvasRef: React.RefObject<HTMLDivElement>) {
  const addElement = usePdfStore((s) => s.addElement)
  const isDrawing = useRef(false)
  const currentId = useRef<string>('')

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    isDrawing.current = true
    currentId.current = crypto.randomUUID()
    const el: DrawElement = {
      type: 'draw',
      id: currentId.current,
      points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
      color: 'rgba(255,230,0,0.4)',
      width: 16,
    }
    addElement(el)
    // ... attach mousemove to keep pushing points via updateElement
  }, [canvasRef, addElement])

  return { onMouseDown }
}
```

#### Step 4 — Create the component

Create `src/components/editor/DrawElement.tsx` that renders an SVG polyline using the element's points.

#### Step 5 — Register in EditOverlay

In `src/components/editor/EditOverlay.tsx`, import `DrawElement` component and add:

```tsx
el.type === 'draw' ? <DrawElement key={el.id} element={el} /> : null
```

#### Step 6 — Add the toolbar button

In `src/components/toolbar/EditActions.tsx`, add:

```tsx
<button className={`btn ${activeTool === 'draw' ? 'active' : ''}`}
  onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}>
  <i className="fas fa-highlighter" /> Resaltar
</button>
```

#### Step 7 — Add properties panel (optional)

Create `src/components/panels/DrawProperties.tsx` for color/width controls, then register it in `PropertiesPanel.tsx`.

#### Step 8 — Handle save

In `src/services/pdfSaver.ts`, inside the loop add a branch for `el.type === 'draw'` that converts the points array to a pdf-lib path using `page.drawSvgPath(...)`.

---

## Component Tree

```
App
├── AppLayout
│   ├── Header
│   │   └── Toolbar
│   │       ├── FileActions
│   │       ├── EditActions
│   │       ├── PageActions
│   │       ├── TransformActions
│   │       └── ZoomControl
│   ├── ThumbnailSidebar
│   │   └── ThumbnailItem (×N)
│   ├── EditorArea
│   │   ├── UploadZone          (when no PDF loaded)
│   │   └── PageWrapper         (when PDF loaded)
│   │       ├── PdfCanvas
│   │       ├── TextLayer
│   │       ├── EditOverlay
│   │       │   ├── TextElement (×N)
│   │       │   └── ImageElement (×N)
│   │       └── CropOverlay
│   ├── PropertiesPanel
│   │   ├── TextProperties      (when text selected)
│   │   ├── ImageProperties     (when image selected)
│   │   ├── CropProperties      (when crop tool active)
│   │   └── PageInfo
│   └── PageNav
├── OcrOverlay
└── ToastContainer
```

---

## Store Shape Reference

```typescript
// src/store/usePdfStore.ts

interface PdfStore {
  // --- State ---
  pdfDoc: PDFDocumentProxy | null        // pdfjs document (for rendering)
  pdfLibDoc: PDFDocument | null          // pdf-lib document (for mutations)
  pdfBytes: Uint8Array | null            // raw bytes (for save baseline)
  fileName: string                       // original file name
  currentPage: number                    // 1-indexed
  totalPages: number
  zoom: number                           // 0.25 – 3.0
  elements: Record<number, OverlayElement[]>  // page number → elements
  selectedId: string | null
  activeTool: ToolName                   // 'text' | 'crop' | null
  ocrData: Record<number, OcrData>       // page number → OCR result
  ocrProgress: number                    // 0–100
  ocrActive: boolean
  toasts: Toast[]
  viewportRef: { width: number; height: number } | null  // rendered canvas size

  // --- Actions ---
  loadPdf(file: File): Promise<void>
  savePdf(): Promise<void>
  refreshLibDoc(): Promise<void>         // re-render after pdf-lib mutation
  goToPage(n: number): void
  setZoom(z: number): void
  addElement(el: OverlayElement): void
  updateElement(id: string, patch: Partial<OverlayElement>): void
  deleteElement(id: string): void
  selectElement(id: string | null): void
  setActiveTool(tool: ToolName): void
  addPage(): Promise<void>
  duplicatePage(): Promise<void>
  deletePage(n: number): Promise<void>
  rotateCurrentPage(): Promise<void>
  cropCurrentPage(x, y, w, h: number): Promise<void>
  runOcr(pageNum: number, canvas: HTMLCanvasElement): Promise<void>
  addToast(message: string, type: 'success'|'error'|'info'): void
  removeToast(id: string): void
  setViewport(vp: {width:number;height:number}|null): void
}
```

---

## Services API Reference

### pdfLoader.ts

```typescript
loadPdfFile(file: File): Promise<LoadedPdf>
// Loads a File into both pdfjs and pdf-lib. Returns pdfDoc, pdfLibDoc, pdfBytes, totalPages.

refreshFromLibDoc(pdfLibDoc: PDFDocument): Promise<{pdfDoc, pdfBytes}>
// Re-serializes pdf-lib doc to bytes, then re-parses with pdfjs. Call after any pdf-lib mutation.
```

### pdfSaver.ts

```typescript
savePdfWithOverlays(
  pdfBytes: Uint8Array,
  elements: Record<number, OverlayElement[]>,
  totalPages: number,
  fileName: string,
  zoom: number
): Promise<void>
// Loads pdfBytes, draws all overlay elements onto each page, triggers browser download.
```

### pageOps.ts

```typescript
addBlankPage(doc: PDFDocument): Promise<PDFDocument>
duplicatePageInDoc(doc: PDFDocument, pageIndex: number): Promise<PDFDocument>
deletePageFromDoc(doc: PDFDocument, pageIndex: number): PDFDocument
rotatePageInDoc(doc: PDFDocument, pageIndex: number): PDFDocument
cropPageInDoc(doc: PDFDocument, pageIndex: number, x, y, w, h: number): PDFDocument
// All operate on a pdf-lib PDFDocument in-place and return it.
// Call store.refreshLibDoc() after any of these to re-render.
```

### ocrService.ts

```typescript
runOcrOnCanvas(
  canvas: HTMLCanvasElement,
  onProgress: (pct: number) => void
): Promise<OcrData>
// Runs Tesseract.js (spa+eng) on the provided canvas. Calls onProgress(0–100) during recognition.
// Returns OcrData: { lines: Array<{ text, bbox }> }
```

---

## Development Workflow

### Setup

```bash
cd C:\Users\USER\Downloads\pdf-editor
npm install
npm run dev
```

The app starts at http://localhost:5173.

### Build

```bash
npm run build
# Output in dist/
npm run preview
# Preview the built app locally
```

### Adding a New Page Operation

1. Add the function to `src/services/pageOps.ts`
2. Add the action to `src/store/usePdfStore.ts` (call the service function, then call `refreshLibDoc()`)
3. Add a button to the appropriate toolbar component in `src/components/toolbar/`

### Adding a New Overlay Element Type

1. Define the interface in `src/types/index.ts` and add it to the `OverlayElement` union
2. Add rendering support in `src/components/editor/EditOverlay.tsx`
3. Create a component in `src/components/editor/`
4. Add save logic in `src/services/pdfSaver.ts`
5. Optionally add a properties panel in `src/components/panels/`

### Adding a New Keyboard Shortcut

Edit `src/hooks/useKeyboardShortcuts.ts`. Subscribe to any store selectors you need, then add a condition inside the `handler` function.

### Key Patterns

- **State access**: always use `usePdfStore((s) => s.field)` (selector pattern to avoid unnecessary re-renders)
- **After pdf-lib mutations**: always call `get().refreshLibDoc()` to sync pdfjs with the mutated doc
- **Element IDs**: use `crypto.randomUUID()` when creating new elements
- **Page indexing**: store uses 1-based page numbers; pdf-lib uses 0-based page indices (subtract 1 when calling pageOps)
