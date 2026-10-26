import { createEvent } from 'ics'
import type { Deadline } from '../lib/deadline'
import { UYARI } from '../templates/engine'

/** All-day reminder event for a computed deadline. Returns the .ics text. */
export function buildIcs(deadline: Deadline, templateTitle: string): string {
  const d = deadline.date
  const { error, value } = createEvent({
    title: deadline.title,
    description: `${templateTitle}. Hesaplanan son gün: ${deadline.label}. ${UYARI}`,
    start: [d.getFullYear(), d.getMonth() + 1, d.getDate()],
    duration: { days: 1 },
    productId: 'dilekcem',
    alarms: [
      { action: 'display', description: deadline.title, trigger: { days: 1, before: true } },
    ],
  })
  if (error || !value) throw new Error('Hatırlatıcı oluşturulamadı.')
  return value
}

export const createIcsBlob = (deadline: Deadline, templateTitle: string): Blob =>
  new Blob([buildIcs(deadline, templateTitle)], { type: 'text/calendar;charset=utf-8' })
