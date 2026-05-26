import { usePdfStore } from '../../store/usePdfStore'
import type { ShapeElement } from '../../types'

export default function ShapeProperties({ element }: { element: ShapeElement }) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const deleteElement = usePdfStore((s) => s.deleteElement)

  return (
    <div className="panel-section">
      <h4>Propiedades Forma</h4>
      <div className="prop-row">
        <label>Borde</label>
        <input type="color" value={element.strokeColor}
          onChange={(e) => updateElement(element.id, { strokeColor: e.target.value })} />
      </div>
      <div className="prop-row">
        <label>Relleno</label>
        <input type="color" value={element.fillColor === 'transparent' ? '#ffffff' : element.fillColor}
          onChange={(e) => updateElement(element.id, { fillColor: e.target.value })} />
      </div>
      <div className="prop-row">
        <label>Grosor</label>
        <input type="number" value={element.strokeWidth} min={1} max={20}
          onChange={(e) => updateElement(element.id, { strokeWidth: parseInt(e.target.value) })} />
      </div>
      <button className="btn danger" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => deleteElement(element.id)}>
        <i className="fas fa-trash" /> Eliminar
      </button>
    </div>
  )
}
