import { parseIsoDate } from './dates'
import { isValidTckn } from './tckn'

export type FieldType =
  'text' | 'textarea' | 'email' | 'tel' | 'date' | 'tckn' | 'number' | 'select'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^(?:\+90|0)?[2-58]\d{9}$/

export const normalizePhone = (v: string): string => v.replace(/[\s()-]/g, '')

/** Returns a Turkish error message, or null when the value is acceptable. */
export function validateValue(
  type: FieldType,
  value: string,
  required: boolean,
  maxLength = 4000,
): string | null {
  const v = value.trim()
  if (v === '') return required ? 'Bu alan zorunludur.' : null
  if (v.length > maxLength) return `En fazla ${maxLength} karakter yazabilirsiniz.`
  switch (type) {
    case 'email':
      return EMAIL.test(v) ? null : 'Geçerli bir e-posta adresi yazın (örnek: ad@ornek.com).'
    case 'tel':
      return PHONE.test(normalizePhone(v))
        ? null
        : 'Geçerli bir telefon numarası yazın (örnek: 0532 123 45 67).'
    case 'tckn':
      return isValidTckn(v) ? null : 'T.C. kimlik numarası 11 haneli ve geçerli olmalıdır.'
    case 'date':
      return parseIsoDate(v) ? null : 'Geçerli bir tarih seçin.'
    case 'number':
      return /^\d+([.,]\d{1,2})?$/.test(v)
        ? null
        : 'Yalnızca sayı yazın (örnek: 1250 veya 1250,50).'
    default:
      return null
  }
}
