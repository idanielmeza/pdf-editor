import { usePdfStore } from '../../store/usePdfStore'
import { useI18nStore } from '../../store/useI18nStore'
import ToolbarGroup from './ToolbarGroup'

function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export default function FileActions() {
  const loadPdf = usePdfStore((s) => s.loadPdf)
  const savePdf = usePdfStore((s) => s.savePdf)
  const mergePdf = usePdfStore((s) => s.mergePdf)
  const exportWord = usePdfStore((s) => s.exportWord)
  const undo = usePdfStore((s) => s.undo)
  const redo = usePdfStore((s) => s.redo)
  const historyIndex = usePdfStore((s) => s.historyIndex)
  const historyLen = usePdfStore((s) => s.elementHistory.length)
  const pdfDoc = usePdfStore((s) => s.pdfDoc)
  const { t } = useI18nStore()

  async function handleOpen() {
    const file = await pickFile('.pdf')
    if (file) loadPdf(file)
  }

  async function handleMerge() {
    if (!pdfDoc) return
    const file = await pickFile('.pdf')
    if (file) mergePdf(file)
  }

  return (
    <>
      <ToolbarGroup>
        <button className="btn" title="Abrir PDF desde disco" onClick={handleOpen}>
          <i className="fas fa-folder-open" /> {t('open')}
        </button>
        <button className="btn" title="Fusionar otro PDF al final del actual" onClick={handleMerge} disabled={!pdfDoc}>
          <i className="fas fa-file-import" /> {t('merge')}
        </button>
        <button className="btn primary" title="Guardar PDF con todos los cambios" onClick={savePdf} disabled={!pdfDoc}>
          <i className="fas fa-save" /> {t('save')}
        </button>
        <button className="btn" title="Exportar contenido como documento Word (.docx)" onClick={exportWord} disabled={!pdfDoc}>
          <i className="fas fa-file-word" /> {t('word')}
        </button>
      </ToolbarGroup>
      <ToolbarGroup>
        <button className="btn" title={t('undo')} onClick={undo} disabled={!pdfDoc || historyIndex < 1}>
          <i className="fas fa-undo" />
        </button>
        <button className="btn" title={t('redo')} onClick={redo} disabled={!pdfDoc || historyIndex >= historyLen - 1}>
          <i className="fas fa-redo" />
        </button>
      </ToolbarGroup>
    </>
  )
}
