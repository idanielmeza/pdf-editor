import { usePdfStore } from '../../store/usePdfStore'

export default function CropProperties() {
  const setActiveTool = usePdfStore((s) => s.setActiveTool)

  return (
    <div className="panel-section">
      <h4>Recortar</h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Dibuja el área a recortar en la página
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setActiveTool(null)}>
          <i className="fas fa-times" /> Cancelar
        </button>
      </div>
    </div>
  )
}
