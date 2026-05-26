import { usePdfStore } from '../../store/usePdfStore'

const icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info' } as const

export default function ToastContainer() {
  const toasts = usePdfStore((s) => s.toasts)
  const removeToast = usePdfStore((s) => s.removeToast)

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
          <i className={`fas ${icons[t.type]}`} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
