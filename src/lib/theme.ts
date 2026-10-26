import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from './storage'

export type Theme = 'light' | 'dark'
const KEY = 'dilekcem:theme'

function effectiveTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** `theme` is null until mounted so server and first client render agree. */
export function useTheme(): { theme: Theme | null; toggle: () => void } {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const stored = readStorage(KEY)
    if (stored === 'light' || stored === 'dark')
      document.documentElement.setAttribute('data-theme', stored)
    setTheme(effectiveTheme())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => setTheme(effectiveTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = effectiveTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    writeStorage(KEY, next)
    setTheme(next)
  }, [])

  return { theme, toggle }
}
