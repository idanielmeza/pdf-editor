import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'

export default function UploadZone() {
  const loadPdf = usePdfStore((s) => s.loadPdf)
  const boxRef = useRef<HTMLDivElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    boxRef.current?.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') loadPdf(file)
  }

  return (
    <div className="upload-zone">
      <div
        ref={boxRef}
        className="upload-box"
        onClick={() => document.getElementById('pdf-file-input')?.click()}
        onDragOver={(e) => { e.preventDefault(); boxRef.current?.classList.add('drag-over') }}
        onDragLeave={() => boxRef.current?.classList.remove('drag-over')}
        onDrop={handleDrop}
      >
        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-secondary)', display: 'block' }} />
        <h2>Abre tu PDF</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Arrastra o haz clic</p>
      </div>
      <input id="pdf-file-input" type="file" accept=".pdf" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) loadPdf(e.target.files[0]); (e.target as HTMLInputElement).value = '' }} />
    </div>
  )
}
