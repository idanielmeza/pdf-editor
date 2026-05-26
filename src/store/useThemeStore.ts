import { create } from 'zustand'

type Theme = 'dark' | 'light'

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

const savedTheme = (localStorage.getItem('theme') as Theme) ?? 'dark'
applyTheme(savedTheme)

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: savedTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    applyTheme(next)
    set({ theme: next })
  },
}))
