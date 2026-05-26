import { usePdfStore } from '../../store/usePdfStore'
import TextProperties from './TextProperties'
import ImageProperties from './ImageProperties'
import ShapeProperties from './ShapeProperties'
import CropProperties from './CropProperties'
import PageInfo from './PageInfo'

export default function PropertiesPanel() {
  const selectedId = usePdfStore((s) => s.selectedId)
  const elements = usePdfStore((s) => s.elements)
  const currentPage = usePdfStore((s) => s.currentPage)
  const activeTool = usePdfStore((s) => s.activeTool)

  const selectedEl = selectedId ? elements[currentPage]?.find((e) => e.id === selectedId) : null

  return (
    <aside className="properties-panel">
      {selectedEl?.type === 'text' && <TextProperties element={selectedEl} />}
      {selectedEl?.type === 'image' && <ImageProperties element={selectedEl} />}
      {selectedEl?.type === 'shape' && <ShapeProperties element={selectedEl} />}
      {activeTool === 'crop' && <CropProperties />}
      <PageInfo />
    </aside>
  )
}
