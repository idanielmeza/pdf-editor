import { usePdfStore } from '../../store/usePdfStore'
import type { TextElement } from '../../types'

const FONTS = [
  // Sans-serif
  'Arial', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Quicksand', 'Exo 2',
  // Display
  'Oswald', 'Fjalla One', 'Anton', 'Bebas Neue', 'Righteous',
  // Serif
  'Playfair Display', 'Merriweather', 'Georgia', 'Times New Roman',
  // Decorative
  'Pacifico', 'Dancing Script', 'Lobster', 'Abril Fatface',
  // Mono
  'Source Code Pro', 'Courier New',
  // System
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact',
]

export default function TextProperties({ element }: { element: TextElement }) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const deleteElement = usePdfStore((s) => s.deleteElement)

  return (
    <div className="panel-section">
      <h4>Propiedades Texto</h4>
      <div className="prop-row">
        <label>Fuente</label>
        <select value={element.font} onChange={(e) => updateElement(element.id, { font: e.target.value })}>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="prop-row">
        <label>Tamaño</label>
        <input type="number" value={element.size} min={8} max={100}
          onChange={(e) => updateElement(element.id, { size: parseInt(e.target.value) })} />
      </div>
      <div className="prop-row">
        <label>Color</label>
        <input type="color" value={element.color}
          onChange={(e) => updateElement(element.id, { color: e.target.value })} />
      </div>
      <button className="btn danger" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => deleteElement(element.id)}>
        <i className="fas fa-trash" /> Eliminar
      </button>
    </div>
  )
}
