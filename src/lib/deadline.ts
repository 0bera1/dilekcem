import { addDays, addMonths, addYears, differenceInCalendarDays, format, isWeekend } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Sure } from '../data/schema'
import { merciById, type TemplateDef, type Values } from '../templates/engine'
import { parseIsoDate, toIsoDate } from './dates'

/** Adds a legal duration. "İş günü" skips weekends only; public holidays are not modelled. */
export function addSure(start: Date, sure: Sure): Date {
  switch (sure.birim) {
    case 'gun':
      return addDays(start, sure.deger)
    case 'ay':
      return addMonths(start, sure.deger)
    case 'yil':
      return addYears(start, sure.deger)
    case 'is-gunu': {
      let d = start
      let left = sure.deger
      while (left > 0) {
        d = addDays(d, 1)
        if (!isWeekend(d)) left -= 1
      }
      return d
    }
  }
}

export interface Deadline {
  title: string
  sure: Sure
  date: Date
  iso: string
  label: string
  /** Whole days from `today`; negative when passed. */
  daysLeft: number
  businessDayNote: boolean
}

export function computeDeadlines(def: TemplateDef, values: Values, today: Date): Deadline[] {
  const merci = merciById.get(def.where.merciId)
  const out: Deadline[] = []
  for (const r of def.reminders ?? []) {
    const start = parseIsoDate((values[r.fromField] ?? '').trim())
    const sure = merci?.sureler.find((s) => s.id === r.sureId)
    if (!start || !sure) continue
    const date = addSure(start, sure)
    out.push({
      title: r.title,
      sure,
      date,
      iso: toIsoDate(date),
      label: format(date, 'd MMMM yyyy, EEEE', { locale: tr }),
      daysLeft: differenceInCalendarDays(date, today),
      businessDayNote: sure.birim === 'is-gunu',
    })
  }
  return out
}
