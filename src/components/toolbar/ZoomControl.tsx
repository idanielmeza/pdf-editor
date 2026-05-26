import { useZoom } from '../../hooks/useZoom'
import ToolbarGroup from './ToolbarGroup'

export default function ZoomControl() {
  const { zoomLabel, zoomIn, zoomOut } = useZoom()
  return (
    <ToolbarGroup>
      <button className="btn" title="Alejar (zoom out)" onClick={zoomOut}><i className="fas fa-search-minus" /></button>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 40, textAlign: 'center' }}>{zoomLabel}</span>
      <button className="btn" title="Acercar (zoom in)" onClick={zoomIn}><i className="fas fa-search-plus" /></button>
    </ToolbarGroup>
  )
}
