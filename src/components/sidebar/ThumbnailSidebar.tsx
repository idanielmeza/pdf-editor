import { usePdfStore } from '../../store/usePdfStore'
import { useThumbnails } from '../../hooks/useThumbnails'
import ThumbnailItem from './ThumbnailItem'

export default function ThumbnailSidebar() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const totalPages = usePdfStore((s) => s.totalPages)
  const currentPage = usePdfStore((s) => s.currentPage)
  const thumbnails = useThumbnails(pdfDoc, totalPages)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Páginas</span><span>{totalPages}</span>
      </div>
      <div className="thumbnails-container">
        {thumbnails.map((t) => (
          <ThumbnailItem key={t.pageNum} {...t} isActive={t.pageNum === currentPage} />
        ))}
      </div>
    </aside>
  )
}
