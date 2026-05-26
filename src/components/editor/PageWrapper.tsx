import { useRef } from 'react'
import PdfCanvas from './PdfCanvas'
import TextLayer from './TextLayer'
import EditOverlay from './EditOverlay'
import CropOverlay from './CropOverlay'

export default function PageWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  return (
    <div className="page-wrapper" ref={wrapperRef}>
      <PdfCanvas />
      <TextLayer />
      <EditOverlay />
      <CropOverlay overlayParentRef={wrapperRef} />
    </div>
  )
}
