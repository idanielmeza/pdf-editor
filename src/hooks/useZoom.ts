import { usePdfStore } from '../store/usePdfStore'

export function useZoom() {
  const zoom = usePdfStore((s) => s.zoom)
  const setZoom = usePdfStore((s) => s.setZoom)

  return {
    zoom,
    zoomIn: () => setZoom(zoom + 0.25),
    zoomOut: () => setZoom(zoom - 0.25),
    zoomLabel: `${Math.round(zoom * 100)}%`,
  }
}
