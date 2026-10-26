import { describe, expect, it } from 'vitest'
import { formatLongDate, formatShortDate, parseIsoDate } from './dates'
import { isValidTckn } from './tckn'
import { capitalizeTr, compareTr, includesTr, lowerTr, searchKey, slugify, upperTr } from './tr'
import { validateValue } from './validation'

describe('Turkish helpers', () => {
  it('upper-cases with dotted and dotless i', () => {
    expect(upperTr('ığüşöçi')).toBe('IĞÜŞÖÇİ')
    expect(upperTr('istanbul')).toBe('İSTANBUL')
    expect(upperTr('ılık')).toBe('ILIK')
  })
  it('lower-cases İ and I correctly', () => {
    expect(lowerTr('İSTANBUL')).toBe('istanbul')
    expect(lowerTr('IŞIK')).toBe('ışık')
  })
  it('capitalizes the first letter', () => {
    expect(capitalizeTr('izmir')).toBe('İzmir')
    expect(capitalizeTr('ışık')).toBe('Işık')
    expect(capitalizeTr('')).toBe('')
  })
  it('searches tolerant of dotted/dotless i and diacritics', () => {
    expect(includesTr('İstifa dilekçesi', 'istifa')).toBe(true)
    expect(includesTr('İstifa dilekçesi', 'ISTIFA')).toBe(true)
    expect(includesTr('Kişisel veri', 'kisisel')).toBe(true)
    expect(includesTr('Çalışma belgesi', 'calisma')).toBe(true)
    expect(includesTr('Çalışma belgesi', 'trafik')).toBe(false)
    expect(searchKey('  IŞIK   ')).toBe('isik')
  })
  it('sorts with Turkish collation', () => {
    expect(['Işık', 'Ilık', 'İzin', 'Çay', 'Cam'].sort(compareTr)).toEqual([
      'Cam',
      'Çay',
      'Ilık',
      'Işık',
      'İzin',
    ])
  })
  it('slugifies', () => {
    expect(slugify('Ürün İadesi / Cayma')).toBe('urun-iadesi-cayma')
  })
})

describe('T.C. kimlik no', () => {
  it('accepts a valid number', () => {
    expect(isValidTckn('10000000146')).toBe(true)
  })
  it('rejects bad length, leading zero, and bad checksum', () => {
    expect(isValidTckn('1000000014')).toBe(false)
    expect(isValidTckn('01234567890')).toBe(false)
    expect(isValidTckn('10000000147')).toBe(false)
    expect(isValidTckn('1000000014a')).toBe(false)
    expect(isValidTckn('')).toBe(false)
  })
})

describe('dates', () => {
  it('parses only real ISO dates', () => {
    expect(parseIsoDate('2026-02-28')).not.toBeNull()
    expect(parseIsoDate('2026-02-30')).toBeNull()
    expect(parseIsoDate('10.03.2026')).toBeNull()
    expect(parseIsoDate('')).toBeNull()
  })
  it('formats in Turkish', () => {
    expect(formatLongDate('2026-03-10')).toBe('10 Mart 2026')
    expect(formatLongDate('2026-10-05')).toBe('5 Ekim 2026')
    expect(formatShortDate('2026-03-10')).toBe('10.03.2026')
    expect(formatLongDate('bad')).toBeNull()
  })
})

describe('field validation', () => {
  it('requires required fields only', () => {
    expect(validateValue('text', '  ', true)).toBe('Bu alan zorunludur.')
    expect(validateValue('text', '', false)).toBeNull()
  })
  it('validates email', () => {
    expect(validateValue('email', 'ayse@ornek.com', false)).toBeNull()
    expect(validateValue('email', 'ayse@', false)).not.toBeNull()
  })
  it('validates Turkish phone numbers', () => {
    for (const ok of [
      '0532 123 45 67',
      '+90 532 123 45 67',
      '5321234567',
      '0312 123 45 67',
      '(0532) 123-45-67',
    ])
      expect(validateValue('tel', ok, false), ok).toBeNull()
    for (const bad of ['123', '0532 123 45', 'abc', '1532 123 45 67'])
      expect(validateValue('tel', bad, false), bad).not.toBeNull()
  })
  it('validates tckn, date, number', () => {
    expect(validateValue('tckn', '10000000146', false)).toBeNull()
    expect(validateValue('tckn', '12345678901', false)).not.toBeNull()
    expect(validateValue('date', '2026-03-10', true)).toBeNull()
    expect(validateValue('date', '2026-13-10', true)).not.toBeNull()
    expect(validateValue('number', '1250,50', true)).toBeNull()
    expect(validateValue('number', 'bin', true)).not.toBeNull()
  })
  it('enforces max length', () => {
    expect(validateValue('text', 'a'.repeat(11), false, 10)).toMatch(/En fazla 10/)
  })
})
