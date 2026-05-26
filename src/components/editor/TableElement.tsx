import { useState, useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useDrag } from '../../hooks/useDrag'
import DeleteButton from './DeleteButton'
import type { TableElement as TEl } from '../../types'

const FONTS = [
  'Arial', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Quicksand', 'Exo 2',
  'Oswald', 'Fjalla One', 'Anton', 'Bebas Neue', 'Righteous',
  'Playfair Display', 'Merriweather', 'Georgia', 'Times New Roman',
  'Pacifico', 'Dancing Script', 'Lobster', 'Abril Fatface',
  'Source Code Pro', 'Courier New',
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact',
]

export default function TableElement({ element }: { element: TEl }) {
  const selectElement = usePdfStore((s) => s.selectElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const updateElement = usePdfStore((s) => s.updateElement)
  const { onMouseDown } = useDrag(element.id)
  const isSelected = selectedId === element.id
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null)
  const activeCellRef = useRef<HTMLTableCellElement | null>(null)
  // Save selection range so we can restore it after toolbar steals focus
  const savedRange = useRef<Range | null>(null)

  const totalW = element.colWidths.reduce((a, b) => a + b, 0)
  const totalH = element.rowHeights.reduce((a, b) => a + b, 0)

  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  function restoreSelectionAndFocus(): boolean {
    const cell = activeCellRef.current
    if (!cell) return false
    cell.focus()
    const sel = window.getSelection()
    sel?.removeAllRanges()
    if (savedRange.current) {
      sel?.addRange(savedRange.current)
    } else {
      // Select all content if no saved range
      const range = document.createRange()
      range.selectNodeContents(cell)
      sel?.addRange(range)
    }
    return true
  }

  function execCmd(cmd: string, value?: string) {
    if (!restoreSelectionAndFocus()) return
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(cmd, false, value)
    saveSelection()
    // Persist to store
    if (activeCell && activeCellRef.current) {
      updateCell(activeCell.r, activeCell.c, activeCellRef.current.innerHTML)
    }
  }

  function applyFontFamily(font: string) {
    execCmd('fontName', font)
  }

  function applyFontSize(px: number) {
    if (!restoreSelectionAndFocus()) return
    const cell = activeCellRef.current!
    document.execCommand('styleWithCSS', false, 'true')
    // Use fontSize 7 then patch with real px via inline style on generated <font> tags
    document.execCommand('fontSize', false, '7')
    cell.querySelectorAll('font[size="7"]').forEach((el) => {
      ;(el as HTMLElement).removeAttribute('size')
      ;(el as HTMLElement).style.fontSize = `${px}px`
    })
    saveSelection()
    if (activeCell) updateCell(activeCell.r, activeCell.c, cell.innerHTML)
  }

  function updateCell(r: number, c: number, val: string) {
    const cells = element.cells.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? val : cell)) : row
    )
    updateElement(element.id, { cells })
  }

  function onColResize(colIdx: number, e: React.MouseEvent) {
    e.stopPropagation(); e.preventDefault()
    const startX = e.clientX, origW = element.colWidths[colIdx]
    const onMove = (e2: MouseEvent) => {
      updateElement(element.id, { colWidths: element.colWidths.map((w, i) => i === colIdx ? Math.max(30, origW + (e2.clientX - startX)) : w) })
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
  }

  function onRowResize(rowIdx: number, e: React.MouseEvent) {
    e.stopPropagation(); e.preventDefault()
    const startY = e.clientY, origH = element.rowHeights[rowIdx]
    const onMove = (e2: MouseEvent) => {
      updateElement(element.id, { rowHeights: element.rowHeights.map((h, i) => i === rowIdx ? Math.max(20, origH + (e2.clientY - startY)) : h) })
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      style={{ position: 'absolute', left: element.x, top: element.y, pointerEvents: 'auto' }}
      onClick={() => selectElement(element.id)}
    >
      {isSelected && <DeleteButton id={element.id} />}

      {isSelected && activeCell && (
        <div
          onMouseDown={(e) => { e.preventDefault(); saveSelection() }}
          style={{
            position: 'absolute', top: -42, left: 0, zIndex: 50,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 6, padding: '4px 8px', display: 'flex', gap: 6, alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
          }}
        >
          <select
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 4, fontSize: '0.75rem', padding: '2px 4px', maxWidth: 130 }}
            defaultValue="Arial"
            onMouseDown={(e) => { e.stopPropagation(); saveSelection() }}
            onChange={(e) => applyFontFamily(e.target.value)}
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <input
            type="number" min={6} max={96} defaultValue={element.fontSize}
            style={{ width: 44, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 4, fontSize: '0.75rem', padding: '2px 4px' }}
            onMouseDown={(e) => { e.stopPropagation(); saveSelection() }}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                const v = parseInt((e.target as HTMLInputElement).value)
                if (!isNaN(v) && v > 0) applyFontSize(v)
              }
            }}
            onBlur={(e) => {
              const v = parseInt(e.target.value)
              if (!isNaN(v) && v > 0) applyFontSize(v)
            }}
          />

          <button className="btn" style={{ padding: '2px 7px', fontWeight: 700, fontSize: '0.85rem', minWidth: 26 }}
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); execCmd('bold') }}>B</button>

          <button className="btn" style={{ padding: '2px 7px', fontStyle: 'italic', fontSize: '0.85rem', minWidth: 26 }}
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); execCmd('italic') }}>I</button>

          <button className="btn" style={{ padding: '2px 7px', textDecoration: 'underline', fontSize: '0.85rem', minWidth: 26 }}
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); execCmd('underline') }}>U</button>

          <input type="color" defaultValue="#000000" title="Color de texto"
            style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            onMouseDown={(e) => { e.stopPropagation(); saveSelection() }}
            onInput={(e) => execCmd('foreColor', (e.target as HTMLInputElement).value)}
          />

          <div style={{ width: 1, background: 'var(--border-color)', alignSelf: 'stretch', margin: '0 2px' }} />

          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Header</span>
          <input type="color"
            defaultValue={element.headerBg === 'transparent' ? '#e8e8e8' : element.headerBg}
            title="Color de encabezado"
            style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            onMouseDown={(e) => { e.stopPropagation(); saveSelection() }}
            onInput={(e) => updateElement(element.id, { headerBg: (e.target as HTMLInputElement).value })}
          />

          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Borde</span>
          <input type="color"
            defaultValue={element.borderColor}
            title="Color de borde"
            style={{ width: 26, height: 26, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            onMouseDown={(e) => { e.stopPropagation(); saveSelection() }}
            onInput={(e) => updateElement(element.id, { borderColor: (e.target as HTMLInputElement).value })}
          />
        </div>
      )}

      {/* Col resize handles */}
      {isSelected && (() => {
        let xOff = 0
        return element.colWidths.slice(0, -1).map((w, ci) => {
          xOff += w
          return <div key={`cr-${ci}`} onMouseDown={(e) => onColResize(ci, e)}
            style={{ position: 'absolute', left: xOff - 3, top: 0, width: 6, height: totalH, cursor: 'col-resize', zIndex: 30, background: 'rgba(108,92,231,0.35)' }} />
        })
      })()}

      {/* Row resize handles */}
      {isSelected && (() => {
        let yOff = 0
        return element.rowHeights.slice(0, -1).map((h, ri) => {
          yOff += h
          return <div key={`rr-${ri}`} onMouseDown={(e) => onRowResize(ri, e)}
            style={{ position: 'absolute', left: 0, top: yOff - 3, width: totalW, height: 6, cursor: 'row-resize', zIndex: 30, background: 'rgba(108,92,231,0.35)' }} />
        })
      })()}

      <div
        className={`image-element ${isSelected ? 'selected' : ''}`}
        style={{ position: 'relative', cursor: 'move', width: totalW, height: totalH }}
        onMouseDown={(e) => {
          const tag = (e.target as HTMLElement).tagName
          if (tag === 'TD' || tag === 'TH') return
          selectElement(element.id)
          onMouseDown(e)
        }}
      >
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: totalW }}>
          <tbody>
            {element.cells.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    ref={(el) => { if (activeCell?.r === r && activeCell?.c === c) activeCellRef.current = el }}
                    style={{
                      width: element.colWidths[c],
                      height: element.rowHeights[r],
                      border: `1px solid ${element.borderColor}`,
                      padding: '2px 4px',
                      fontSize: element.fontSize,
                      fontFamily: 'Arial, sans-serif',
                      color: '#000000',
                      background: r === 0 ? element.headerBg : 'white',
                      fontWeight: r === 0 ? 600 : 400,
                      verticalAlign: 'middle',
                      overflow: 'visible',
                      cursor: 'text',
                      boxSizing: 'border-box',
                      outline: activeCell?.r === r && activeCell?.c === c ? '2px solid var(--accent-primary)' : 'none',
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onMouseDown={(e) => { e.stopPropagation(); selectElement(element.id) }}
                    onFocus={(e) => {
                      activeCellRef.current = e.currentTarget
                      setActiveCell({ r, c })
                      savedRange.current = null
                    }}
                    onSelect={() => saveSelection()}
                    onKeyUp={() => saveSelection()}
                    onBlur={(e) => {
                      updateCell(r, c, e.currentTarget.innerHTML)
                      // Don't clear activeCell/ref here — toolbar needs them
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    dangerouslySetInnerHTML={{ __html: cell }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
