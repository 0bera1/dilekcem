import { beforeEach, describe, expect, it } from 'vitest'
import { getTemplate } from '../templates'
import { addSure } from './deadline'
import {
  exportDrafts,
  loadDrafts,
  makeDraft,
  mergeDrafts,
  parseImport,
  storeDrafts,
} from './drafts'

const def = getTemplate('istifa-dilekcesi')!

beforeEach(() => window.localStorage.clear())

describe('drafts', () => {
  it('never keeps the T.C. kimlik no and drops empty values', () => {
    const d = makeDraft(
      def,
      { adSoyad: 'Ayşe', tckn: '10000000146', gorev: ' ' },
      new Date('2026-01-01'),
      'a',
    )
    expect(d.values).toEqual({ adSoyad: 'Ayşe' })
  })

  it('round-trips through storage and export/import', () => {
    const d = makeDraft(def, { adSoyad: 'Ayşe' }, new Date('2026-01-01'), 'a')
    storeDrafts([d])
    expect(loadDrafts()).toEqual([d])
    const imported = parseImport(exportDrafts([d]))
    expect(imported).toEqual({ ok: true, drafts: [d] })
  })

  it('rejects malformed or foreign import files', () => {
    expect(parseImport('not json').ok).toBe(false)
    expect(parseImport('{"version":2,"drafts":[]}').ok).toBe(false)
    expect(parseImport('{"version":1,"drafts":[{"id":1}]}').ok).toBe(false)
  })

  it('ignores drafts for unknown templates', () => {
    const d = { ...makeDraft(def, { adSoyad: 'A' }, new Date(), 'x'), slug: 'yok' }
    const r = parseImport(exportDrafts([d]))
    expect(r).toEqual({ ok: true, drafts: [] })
  })

  it('survives corrupted storage', () => {
    window.localStorage.setItem('dilekcem:drafts', '{broken')
    expect(loadDrafts()).toEqual([])
  })

  it('merges by id, newest first', () => {
    const a = makeDraft(def, { adSoyad: 'A' }, new Date('2026-01-01'), 'a')
    const b = makeDraft(def, { adSoyad: 'B' }, new Date('2026-02-01'), 'b')
    const a2 = makeDraft(def, { adSoyad: 'A2' }, new Date('2026-03-01'), 'a')
    expect(mergeDrafts([a, b], [a2]).map((d) => d.values.adSoyad)).toEqual(['A2', 'B'])
  })
})

describe('deadlines', () => {
  const d = (iso: string): Date => new Date(`${iso}T00:00:00`)
  const sure = (deger: number, birim: 'gun' | 'is-gunu' | 'ay' | 'yil') => ({
    id: 'x',
    etiket: 'x',
    deger,
    birim,
    aciklama: 'x',
  })
  it('adds calendar days, months and years', () => {
    expect(addSure(d('2026-03-10'), sure(14, 'gun')).toDateString()).toBe(
      d('2026-03-24').toDateString(),
    )
    expect(addSure(d('2026-01-31'), sure(1, 'ay')).toDateString()).toBe(
      d('2026-02-28').toDateString(),
    )
    expect(addSure(d('2026-03-10'), sure(2, 'yil')).toDateString()).toBe(
      d('2028-03-10').toDateString(),
    )
  })
  it('skips weekends for business days', () => {
    // Friday 2026-03-06 + 1 business day = Monday 2026-03-09
    expect(addSure(d('2026-03-06'), sure(1, 'is-gunu')).toDateString()).toBe(
      d('2026-03-09').toDateString(),
    )
    // Monday + 5 business days = next Monday
    expect(addSure(d('2026-03-09'), sure(5, 'is-gunu')).toDateString()).toBe(
      d('2026-03-16').toDateString(),
    )
  })
})
