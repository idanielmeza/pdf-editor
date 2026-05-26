import { usePdfStore } from '../../store/usePdfStore'
import ToolbarGroup from './ToolbarGroup'

export default function PageActions() {
  const addPage = usePdfStore((s) => s.addPage)
  const duplicatePage = usePdfStore((s) => s.duplicatePage)
  const deletePage = usePdfStore((s) => s.deletePage)
  const currentPage = usePdfStore((s) => s.currentPage)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)

  return (
    <ToolbarGroup>
      <button className="btn" title="Agregar página en blanco al final" onClick={addPage} disabled={!pdfDoc}><i className="fas fa-plus" /> Página</button>
      <button className="btn" title="Duplicar página actual" onClick={duplicatePage} disabled={!pdfDoc}><i className="fas fa-copy" /> Duplicar</button>
      <button className="btn danger" title="Eliminar página actual (irreversible)" onClick={() => deletePage(currentPage)} disabled={!pdfDoc}><i className="fas fa-trash" /> Eliminar</button>
    </ToolbarGroup>
  )
}
