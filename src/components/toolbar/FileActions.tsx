import { useRef } from 'react'
import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import ToolbarGroup from './ToolbarGroup'

export default function FileActions() {
  const fileRef = useRef<HTMLInputElement>(null)
  const mergeRef = useRef<HTMLInputElement>(null)
  const loadPdf = usePdfStore((s) => s.loadPdf)
  const savePdf = usePdfStore((s) => s.savePdf)
  const mergePdf = usePdfStore((s) => s.mergePdf)
  const exportWord = usePdfStore((s) => s.exportWord)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const { t } = useI18nStore()

  return (
    <ToolbarGroup>
      <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) loadPdf(e.target.files[0]); e.target.value = '' }} />
      <input ref={mergeRef} type="file" accept=".pdf" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) mergePdf(e.target.files[0]); e.target.value = '' }} />
      <button className="btn" title="Abrir PDF desde disco" onClick={() => fileRef.current?.click()}>
        <i className="fas fa-folder-open" /> {t('open')}
      </button>
      <button className="btn" title="Fusionar otro PDF al final del actual" onClick={() => { if (!pdfDoc) return; mergeRef.current?.click() }} disabled={!pdfDoc}>
        <i className="fas fa-file-import" /> {t('merge')}
      </button>
      <button className="btn primary" title="Guardar PDF con todos los cambios" onClick={savePdf} disabled={!pdfDoc}>
        <i className="fas fa-save" /> {t('save')}
      </button>
      <button className="btn" title="Exportar contenido como documento Word (.docx)" onClick={exportWord} disabled={!pdfDoc}>
        <i className="fas fa-file-word" /> {t('word')}
      </button>
    </ToolbarGroup>
  )
}
