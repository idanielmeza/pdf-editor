import { usePdfStore } from '../../store/usePdfStore'
import { useCrop } from '../../hooks/useCrop'

interface Props { overlayParentRef: React.RefObject<HTMLDivElement> }

export default function CropOverlay({ overlayParentRef }: Props) {
  const activeTool = usePdfStore((s) => s.activeTool)
  const { cropRect, onMouseDown, applyCrop, cancelCrop } = useCrop(overlayParentRef)

  if (activeTool !== 'crop') return null

  return (
    <div
      className="crop-overlay active"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
      onMouseDown={onMouseDown}
    >
      {cropRect && (
        <div
          className="crop-selection"
          style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h, display: 'block' }}
        >
          <div className="crop-handle tl" /><div className="crop-handle tr" />
          <div className="crop-handle bl" /><div className="crop-handle br" />
        </div>
      )}
    </div>
  )
}
