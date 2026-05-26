import { usePdfStore } from '../../store/usePdfStore'

export default function DeleteButton({ id }: { id: string }) {
  const deleteElement = usePdfStore((s) => s.deleteElement)

  return (
    <button
      title="Eliminar elemento"
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault() }}
      onClick={(e) => { e.stopPropagation(); deleteElement(id) }}
      style={{
        position: 'absolute',
        top: -10,
        right: -10,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#e74c3c',
        border: '2px solid white',
        color: 'white',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        lineHeight: 1,
        padding: 0,
      }}
    >
      ✕
    </button>
  )
}
