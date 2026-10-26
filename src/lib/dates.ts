import { format, isValid, parse } from 'date-fns'
import { tr } from 'date-fns/locale'

const ISO = 'yyyy-MM-dd'

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = parse(value, ISO, new Date(2000, 0, 1))
  return isValid(d) && format(d, ISO) === value ? d : null
}

export const toIsoDate = (d: Date): string => format(d, ISO)

/** "12 Mart 2026" */
export function formatLongDate(value: string): string | null {
  const d = parseIsoDate(value)
  return d ? format(d, 'd MMMM yyyy', { locale: tr }) : null
}

/** "12.03.2026" */
export function formatShortDate(value: string): string | null {
  const d = parseIsoDate(value)
  return d ? format(d, 'dd.MM.yyyy') : null
}
