import { usePdfStore } from '../../store/usePdfStore'
import UploadZone from './UploadZone'
import PageWrapper from './PageWrapper'

export default function EditorArea() {
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  return (
    <main className="editor-area">
      {!pdfDoc ? <UploadZone /> : <PageWrapper />}
    </main>
  )
}
