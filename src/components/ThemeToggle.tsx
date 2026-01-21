import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1 p-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span
        className={`p-1.5 rounded-full transition-colors ${
          resolvedTheme === 'light'
            ? 'bg-white text-amber-500 shadow-sm'
            : 'text-slate-400'
        }`}
      >
        <Sun size={14} />
      </span>
      <span
        className={`p-1.5 rounded-full transition-colors ${
          resolvedTheme === 'dark'
            ? 'bg-slate-600 text-blue-400 shadow-sm'
            : 'text-slate-400'
        }`}
      >
        <Moon size={14} />
      </span>
    </button>
  )
}
