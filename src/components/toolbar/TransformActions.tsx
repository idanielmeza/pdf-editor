import { usePdfStore } from '../../store/usePdfStore'
import ToolbarGroup from './ToolbarGroup'

export default function TransformActions() {
  const activeTool = usePdfStore((s) => s.activeTool)
  const setActiveTool = usePdfStore((s) => s.setActiveTool)
  const rotateCurrentPage = usePdfStore((s) => s.rotateCurrentPage)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)

  return (
    <ToolbarGroup>
      <button className="btn" title="Rotar página actual 90° en sentido horario" onClick={rotateCurrentPage} disabled={!pdfDoc}>
        <i className="fas fa-redo" /> Rotar
      </button>
    </ToolbarGroup>
  )
}
