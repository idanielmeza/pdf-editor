import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import ToolbarGroup from './ToolbarGroup'

export default function TransformActions() {
  const rotateCurrentPage = usePdfStore((s) => s.rotateCurrentPage)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const { t } = useI18nStore()

  return (
    <ToolbarGroup>
      <button className="btn" title="Rotar página actual 90° en sentido horario" onClick={rotateCurrentPage} disabled={!pdfDoc}>
        <i className="fas fa-redo" /> {t('rotate')}
      </button>
    </ToolbarGroup>
  )
}
