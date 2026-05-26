import Toolbar from '../toolbar/Toolbar'

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <i className="fas fa-file-pdf" />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span>PDF Editor</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: 1 }}>by LedezmaDev</span>
        </div>
      </div>
      <Toolbar />
    </header>
  )
}
