import Toolbar from '../toolbar/Toolbar'
import { useI18nStore } from '../../store/useI18nStore'
import { useThemeStore } from '../../store/useThemeStore'

export default function Header() {
  const { lang, toggleLang } = useI18nStore()
  const { theme, toggleTheme } = useThemeStore()

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto', flexShrink: 0 }}>
        <button
          className="btn"
          title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          onClick={toggleLang}
          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}
        >
          <i className="fas fa-globe" style={{ marginRight: 4 }} />
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
        <button
          className="btn"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          onClick={toggleTheme}
          style={{ padding: '0.35rem 0.6rem' }}
        >
          {theme === 'dark'
            ? <i className="fas fa-sun" />
            : <i className="fas fa-moon" />}
        </button>
      </div>
    </header>
  )
}
