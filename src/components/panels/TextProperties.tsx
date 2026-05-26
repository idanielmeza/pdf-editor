import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import type { TextElement } from '../../types'

const FONTS = [
  'Arial', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Quicksand', 'Exo 2',
  'Oswald', 'Fjalla One', 'Anton', 'Bebas Neue', 'Righteous',
  'Playfair Display', 'Merriweather', 'Georgia', 'Times New Roman',
  'Pacifico', 'Dancing Script', 'Lobster', 'Abril Fatface',
  'Source Code Pro', 'Courier New',
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact',
]

export default function TextProperties({ element }: { element: TextElement }) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const deleteElement = usePdfStore((s) => s.deleteElement)
  const { t } = useI18nStore()

  return (
    <div className="panel-section">
      <h4>{t('textProps')}</h4>
      <div className="prop-row">
        <label>{t('font')}</label>
        <select value={element.font} onChange={(e) => updateElement(element.id, { font: e.target.value })}>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="prop-row">
        <label>{t('size')}</label>
        <input type="number" value={element.size} min={8} max={100}
          onChange={(e) => updateElement(element.id, { size: parseInt(e.target.value) })} />
      </div>
      <div className="prop-row">
        <label>{t('color')}</label>
        <input type="color" value={element.color}
          onChange={(e) => updateElement(element.id, { color: e.target.value })} />
      </div>
      <button className="btn danger" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => deleteElement(element.id)}>
        <i className="fas fa-trash" /> {t('delete')}
      </button>
    </div>
  )
}
