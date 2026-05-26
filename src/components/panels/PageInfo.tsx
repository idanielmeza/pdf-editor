import { usePdfStore } from '../../store/usePdfStore'

export default function PageInfo() {
  const currentPage = usePdfStore((s) => s.currentPage)
  const totalPages = usePdfStore((s) => s.totalPages)
  const viewportRef = usePdfStore((s) => s.viewportRef)

  return (
    <div className="panel-section">
      <h4>Página</h4>
      <div className="prop-row"><label>Pág</label><span>{currentPage} / {totalPages || '-'}</span></div>
      <div className="prop-row"><label>Dim</label><span>{viewportRef ? `${Math.round(viewportRef.width)}x${Math.round(viewportRef.height)}` : '-'}</span></div>
    </div>
  )
}
