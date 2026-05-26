import { useEffect, useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import * as pdfjsLib from 'pdfjs-dist'

export default function TextLayer() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const currentPage = usePdfStore((s) => s.currentPage)
  const zoom = usePdfStore((s) => s.zoom)
  const addElement = usePdfStore((s) => s.addElement)
  const selectElement = usePdfStore((s) => s.selectElement)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return
    const container = containerRef.current
    let cancelled = false

    pdfDoc.getPage(currentPage).then(async (page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale: 1.5 * zoom })
      const textContent = await page.getTextContent()
      if (cancelled) return

      container.innerHTML = ''
      container.style.width = viewport.width + 'px'
      container.style.height = viewport.height + 'px'
      container.style.setProperty('--scale-factor', String(viewport.scale))

      await pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container,
        viewport,
      }).promise

      // After render, attach dblclick on each span to make it inline-editable
      container.querySelectorAll('span').forEach((span) => {
        span.addEventListener('click', () => {
          usePdfStore.getState().selectElement(null)
        })
        span.addEventListener('dblclick', (e) => {
          e.stopPropagation()
          startInlineEdit(span, viewport)
        })
      })
    })

    return () => { cancelled = true }
  }, [pdfDoc, currentPage, zoom])

  function startInlineEdit(span: HTMLSpanElement, viewport: any) {
    if (span.dataset.editing) return
    span.dataset.editing = '1'

    const rect = span.getBoundingClientRect()
    const containerRect = containerRef.current!.getBoundingClientRect()

    const x = rect.left - containerRect.left
    const y = rect.top - containerRect.top
    const w = rect.width
    const h = rect.height
    const originalText = span.textContent ?? ''
    const computedStyle = window.getComputedStyle(span)
    const fontSize = parseFloat(computedStyle.fontSize) || 14

    // Hide original span
    span.style.visibility = 'hidden'

    // Create input overlay
    const input = document.createElement('input')
    input.type = 'text'
    input.value = originalText
    input.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${Math.max(w, 80)}px;
      height: ${h + 4}px;
      font-size: ${fontSize}px;
      font-family: ${computedStyle.fontFamily};
      font-weight: ${computedStyle.fontWeight};
      color: #000000;
      background: rgba(255,255,255,0.95);
      border: 1.5px solid #6c5ce7;
      border-radius: 2px;
      padding: 0 2px;
      outline: none;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(108,92,231,0.3);
    `
    containerRef.current!.appendChild(input)
    input.focus()
    input.select()

    function commit() {
      const newText = input.value.trim()
      input.remove()
      span.style.visibility = 'visible'
      delete span.dataset.editing

      if (newText === originalText || !newText) return

      // White-out original text position
      addElement({
        type: 'shape' as any,
        id: crypto.randomUUID(),
        shapeType: 'rect' as any,
        x: x - 1, y: y - 1,
        w: w + 2, h: h + 2,
        strokeColor: '#ffffff',
        fillColor: '#ffffff',
        strokeWidth: 0,
      } as any)

      // New text overlay on top
      addElement({
        type: 'text',
        id: crypto.randomUUID(),
        x, y,
        content: newText,
        font: computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Inter',
        size: Math.round(fontSize),
        color: '#000000',
      })
    }

    input.addEventListener('blur', commit)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur()
      if (e.key === 'Escape') {
        input.removeEventListener('blur', commit)
        input.remove()
        span.style.visibility = 'visible'
        delete span.dataset.editing
      }
      e.stopPropagation()
    })
  }

  return (
    <div
      ref={containerRef}
      className="textLayer"
      style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', lineHeight: 1 }}
    />
  )
}
