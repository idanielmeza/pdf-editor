import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import type { ImageElement } from '../../types'

export default function ImageProperties({ element }: { element: ImageElement }) {
  const updateElement = usePdfStore((s) => s.updateElement)
  const deleteElement = usePdfStore((s) => s.deleteElement)
  const { t } = useI18nStore()

  return (
    <div className="panel-section">
      <h4>{t('imageProps')}</h4>
      <div className="prop-row">
        <label>{t('width')}</label>
        <input type="number" value={element.w} onChange={(e) => updateElement(element.id, { w: parseInt(e.target.value) })} />
      </div>
      <div className="prop-row">
        <label>{t('height')}</label>
        <input type="number" value={element.h} onChange={(e) => updateElement(element.id, { h: parseInt(e.target.value) })} />
      </div>
      <button className="btn danger" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => deleteElement(element.id)}>
        <i className="fas fa-trash" /> {t('delete')}
      </button>
    </div>
  )
}
