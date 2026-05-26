import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'

export default function PageInfo() {
  const currentPage = usePdfStore((s) => s.currentPage)
  const totalPages = usePdfStore((s) => s.totalPages)
  const viewportRef = usePdfStore((s) => s.viewportRef)
  const { t } = useI18nStore()

  return (
    <div className="panel-section">
      <h4>{t('pageInfo')}</h4>
      <div className="prop-row"><label>{t('pag')}</label><span>{currentPage} / {totalPages || '-'}</span></div>
      <div className="prop-row"><label>{t('dim')}</label><span>{viewportRef ? `${Math.round(viewportRef.width)}x${Math.round(viewportRef.height)}` : '-'}</span></div>
    </div>
  )
}
