import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import s from './CategoryTabs.module.css'

export interface TabDef {
  id: string
  label: string
}

interface Props {
  tabs: TabDef[]
  value: string
  onChange: (id: string) => void
  idPrefix: string
  label: string
  children: ReactNode
}

/** Folder-style tabs with the WAI-ARIA tab pattern: arrow keys move and select. */
export function CategoryTabs({ tabs, value, onChange, idPrefix, label, children }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = tabs.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    const target = tabs[next]
    if (!target) return
    onChange(target.id)
    refs.current[target.id]?.focus()
  }

  return (
    <div className={s.folder}>
      <div role="tablist" aria-label={label} className={s.tablist}>
        {tabs.map((t, i) => {
          const selected = t.id === value
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el
              }}
              role="tab"
              type="button"
              id={`${idPrefix}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`${s.tab} ${selected ? s.active : ''}`}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${idPrefix}-panel`}
        aria-labelledby={`${idPrefix}-tab-${value}`}
        className={s.panel}
      >
        {children}
      </div>
    </div>
  )
}
