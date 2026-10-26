import { describe, expect, it } from 'vitest'
import kararAgaciJson from '../data/karar-agaci.json'
import merciJson from '../data/merciler.json'
import mevzuatJson from '../data/mevzuat.json'
import { kararAgaciSchema, merciListSchema, mevzuatListSchema } from '../data/schema'
import { sampleValues } from '../test/samples'
import {
  CATEGORIES,
  COMMON_FIELDS,
  UYARI,
  allFields,
  letterLength,
  letterToText,
  merciById,
  renderLetter,
  resolveTokens,
  templateMetaSchema,
} from './engine'
import { getTemplate, kararAgaci, searchTemplates, templates } from './index'

const EXPECTED = [
  'abonelik-iptali',
  'urun-iadesi-cayma',
  'ayipli-urun',
  'gec-teslimat',
  'kargo-hasari',
  'banka-ucret-itirazi',
  'tuketici-hakem-heyeti-basvurusu',
  'cimer-basvurusu',
  'bilgi-edinme-basvurusu',
  'trafik-cezasi-itirazi',
  'belediye-sikayeti',
  'kvkk-bilgi-talebi',
  'kvkk-silme-yok-etme-talebi',
  'ticari-ileti-onay-geri-cekme',
  'izin-talebi',
  'istifa-dilekcesi',
  'mazeret-dilekcesi',
  'belge-talebi',
]

describe('data files', () => {
  it('parse against their schemas', () => {
    expect(() => merciListSchema.parse(merciJson)).not.toThrow()
    expect(() => mevzuatListSchema.parse(mevzuatJson)).not.toThrow()
    expect(() => kararAgaciSchema.parse(kararAgaciJson)).not.toThrow()
  })
  it('every unverified merci explains itself', () => {
    for (const m of merciListSchema.parse(merciJson))
      if (!m.verified) expect(m.not, m.id).toBeTruthy()
  })
})

describe('template registry', () => {
  it('contains exactly the required templates', () => {
    expect(templates.map((t) => t.slug).sort()).toEqual([...EXPECTED].sort())
  })
  it('has unique slugs', () => {
    expect(new Set(templates.map((t) => t.slug)).size).toBe(templates.length)
  })
  it('covers every category tab except the guide', () => {
    const cats = new Set(templates.map((t) => t.category))
    for (const c of CATEGORIES) if (c.id !== 'rehber') expect(cats.has(c.id), c.id).toBe(true)
  })
})

describe.each(templates.map((t) => [t.slug, t] as const))('template %s', (_slug, def) => {
  it('has valid metadata', () => {
    expect(() => templateMetaSchema.parse(def)).not.toThrow()
  })
  it('has unique field ids not clashing with common fields', () => {
    const ids = allFields(def).map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of COMMON_FIELDS) expect(def.fields.some((f) => f.id === c.id)).toBe(false)
  })
  it('select fields carry options', () => {
    for (const f of def.fields)
      if (f.type === 'select') expect(f.options?.length, f.id).toBeGreaterThan(1)
  })
  it('points to an existing merci', () => {
    expect(merciById.has(def.where.merciId)).toBe(true)
  })
  it('reminders refer to real date fields and durations', () => {
    for (const r of def.reminders ?? []) {
      expect(allFields(def).find((f) => f.id === r.fromField)?.type).toBe('date')
      expect(merciById.get(def.where.merciId)?.sureler.some((s) => s.id === r.sureId)).toBe(true)
    }
  })
  it('related slugs exist', () => {
    for (const r of def.related) expect(getTemplate(r), r).toBeDefined()
    expect(def.related).not.toContain(def.slug)
  })
  it('resolves every FAQ token', () => {
    for (const f of def.faq) {
      const out = resolveTokens(def, f.a)
      expect(out).not.toMatch(/\{\{/)
    }
  })
  it('matches the snapshot for sample data', () => {
    const letter = renderLetter(def, sampleValues(def))
    expect(letterToText(letter)).toMatchSnapshot()
  })
  it('renders with empty data using placeholders, without throwing', () => {
    const letter = renderLetter(def, {})
    const text = letterToText(letter)
    expect(text).toContain('[Ad Soyad]')
    expect(text).toContain('[Tarih]')
    expect(text).toContain(UYARI)
    expect(letter.paragraflar.length).toBeGreaterThan(0)
    expect(text).not.toMatch(/undefined|NaN|null/)
  })
  it('never inserts raw statutory numbers that are not in data (no unresolved tokens)', () => {
    const text = letterToText(renderLetter(def, sampleValues(def)))
    expect(text).not.toMatch(/\{\{|\}\}/)
  })
  it('stays within the length budget for sample data', () => {
    expect(letterLength(renderLetter(def, sampleValues(def)))).toBeLessThan(6000)
  })
})

describe('letter composition', () => {
  const def = getTemplate('abonelik-iptali')!
  it('omits optional contact lines when empty', () => {
    const text = letterToText(
      renderLetter(def, sampleValues(def, { tckn: '', telefon: '', eposta: '' })),
    )
    expect(text).not.toContain('T.C. Kimlik No')
    expect(text).not.toContain('Telefon:')
    expect(text).not.toContain('E-posta:')
  })
  it('includes contact lines when given', () => {
    const text = letterToText(renderLetter(def, sampleValues(def)))
    expect(text).toContain('T.C. Kimlik No: 10000000146')
    expect(text).toContain('E-posta: ayse@ornek.com')
  })
  it('upper-cases the addressee with Turkish rules', () => {
    const letter = renderLetter(def, sampleValues(def, { firma: 'istanbul ılık su a.ş.' }))
    expect(letter.muhatap[0]).toBe('İSTANBUL ILIK SU A.Ş.')
  })
  it('formats the date in long Turkish form', () => {
    expect(renderLetter(def, sampleValues(def)).tarih).toBe('10 Mart 2026')
  })
})

describe('template behaviour', () => {
  it('hakem heyeti warns when the dispute value is at or above the limit', () => {
    const def = getTemplate('tuketici-hakem-heyeti-basvurusu')!
    const high = letterToText(renderLetter(def, sampleValues(def, { deger: '250000' })))
    const low = letterToText(renderLetter(def, sampleValues(def, { deger: '5000' })))
    expect(high).toContain('[Dikkat:')
    expect(low).not.toContain('[Dikkat:')
    expect(low).toContain('186.000 TL')
  })
  it('ayipli-urun adds the repair deadline only for repair or replacement', () => {
    const def = getTemplate('ayipli-urun')!
    const repair = letterToText(renderLetter(def, sampleValues(def, { talep: 'onarim' })))
    const refund = letterToText(renderLetter(def, sampleValues(def, { talep: 'donme' })))
    expect(repair).toContain('30 iş günü')
    expect(refund).not.toContain('30 iş günü')
  })
})

describe('search', () => {
  it('finds templates tr-aware', () => {
    expect(searchTemplates('ISTIFA').map((t) => t.slug)).toContain('istifa-dilekcesi')
    expect(searchTemplates('', 'kamu')).toHaveLength(4)
    expect(searchTemplates('zzzz')).toHaveLength(0)
  })
})

describe('decision tree', () => {
  const nodes = new Map(kararAgaci.dugumler.map((n) => [n.id, n]))
  it('starts at an existing node', () => {
    expect(nodes.has(kararAgaci.baslangic)).toBe(true)
  })
  it('has no dead ends: every option goes to a node or a valid template', () => {
    for (const n of kararAgaci.dugumler)
      for (const o of n.secenekler) {
        const hasOne = Number(Boolean(o.git)) + Number(Boolean(o.sonuc))
        expect(hasOne, `${n.id} / ${o.etiket}`).toBe(1)
        if (o.git) expect(nodes.has(o.git), o.git).toBe(true)
        if (o.sonuc) expect(getTemplate(o.sonuc), o.sonuc).toBeDefined()
      }
  })
  it('reaches every node from the start and every template at least once', () => {
    const seen = new Set<string>()
    const slugs = new Set<string>()
    const walk = (id: string): void => {
      if (seen.has(id)) return
      seen.add(id)
      for (const o of nodes.get(id)!.secenekler) {
        if (o.git) walk(o.git)
        if (o.sonuc) slugs.add(o.sonuc)
      }
    }
    walk(kararAgaci.baslangic)
    expect(seen.size).toBe(nodes.size)
    expect([...slugs].sort()).toEqual([...EXPECTED].sort())
  })
})
