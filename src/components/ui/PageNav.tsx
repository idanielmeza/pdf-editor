import { usePdfStore } from '../../store/usePdfStore'

export default function PageNav() {
  const currentPage = usePdfStore((s) => s.currentPage)
  const totalPages = usePdfStore((s) => s.totalPages)
  const goToPage = usePdfStore((s) => s.goToPage)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)

  if (!pdfDoc) return null

  return (
    <div className="page-nav">
      <button className="btn" onClick={() => goToPage(currentPage - 1)}><i className="fas fa-chevron-left" /></button>
      <span>
        Pág{' '}
        <input type="number" value={currentPage} min={1} max={totalPages}
          style={{ width: 40, background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: 600 }}
          onChange={(e) => goToPage(parseInt(e.target.value))} />
        {' '}de {totalPages}
      </span>
      <button className="btn" onClick={() => goToPage(currentPage + 1)}><i className="fas fa-chevron-right" /></button>
    </div>
  )
}
