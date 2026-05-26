import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import { useThumbnails } from '../../hooks/useThumbnails'
import ThumbnailItem from './ThumbnailItem'

export default function ThumbnailSidebar() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const totalPages = usePdfStore((s) => s.totalPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const thumbnails = useThumbnails(pdfDoc, totalPages)
  const { t } = useI18nStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{t('pages')}</span><span>{totalPages}</span>
      </div>
      <div className="thumbnails-container">
        {thumbnails.map((thumb) => (
          <ThumbnailItem key={thumb.pageNum} {...thumb} isActive={thumb.pageNum === currentPage} />
        ))}
      </div>
    </aside>
  )
}
