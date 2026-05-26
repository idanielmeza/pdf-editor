import { useEffect } from 'react'
import { usePdfStore } from '../store/usePdfStore'

export function useKeyboardShortcuts() {
  const savePdf = usePdfStore((s) => s.savePdf)
  const deleteElement = usePdfStore((s) => s.deleteElement)
  const selectedId = usePdfStore((s) => s.selectedId)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const selectElement = usePdfStore((s) => s.selectElement)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement
      const isEditing = active && (active as HTMLElement).contentEditable === 'true'
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing && selectedId) {
        deleteElement(selectedId)
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        savePdf()
      }
      if (e.key === 'Escape') {
        setActiveTool(null)
        selectElement(null)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [savePdf, deleteElement, selectedId, setActiveTool, selectElement])
}
