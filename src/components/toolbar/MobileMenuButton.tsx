import { useState, useEffect } from 'react'
import Toolbar from './Toolbar'

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mobile-drawer') && !target.closest('.hamburger-btn')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        className="btn hamburger-btn"
        onClick={() => setOpen((o) => !o)}
        title="Herramientas"
        style={{ padding: '0.35rem 0.6rem' }}
      >
        <i className={`fas fa-${open ? 'times' : 'bars'}`} />
      </button>

      {open && (
        <div className="mobile-drawer" onClick={(e) => {
          // Close drawer when user clicks a button (not a range/color input)
          const target = e.target as HTMLElement
          if (target.tagName === 'BUTTON' || target.closest('button')) {
            setTimeout(() => setOpen(false), 150)
          }
        }}>
          <Toolbar />
        </div>
      )}
    </>
  )
}
