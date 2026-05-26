import React from 'react'
import { usePdfStore } from '../../store/usePdfStore'

interface Props { pageNum: number; dataUrl: string; isActive: boolean }

const ThumbnailItem = React.memo(function ThumbnailItem({ pageNum, dataUrl, isActive }: Props) {
  const goToPage = usePdfStore((s) => s.goToPage)
  const deletePage = usePdfStore((s) => s.deletePage)

  return (
    <div className={`thumbnail-item ${isActive ? 'active' : ''}`} onClick={() => goToPage(pageNum)}>
      <img src={dataUrl} style={{ width: '100%', height: 'auto', display: 'block' }} alt={`Página ${pageNum}`} />
      <span className="thumbnail-num">{pageNum}</span>
      <button className="thumbnail-del" onClick={(e) => { e.stopPropagation(); deletePage(pageNum) }}>
        <i className="fas fa-times" />
      </button>
    </div>
  )
})

export default ThumbnailItem
