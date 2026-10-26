import { z } from 'zod'
import mevzuatJson from '../data/mevzuat.json'
import merciJson from '../data/merciler.json'
import {
  merciListSchema,
  mevzuatListSchema,
  type Merci,
  type Mevzuat,
  type Sure,
} from '../data/schema'
import { formatLongDate } from '../lib/dates'
import type { FieldType } from '../lib/validation'

export const UYARI = 'Bu metin örnektir; durumunuza göre uyarlayın, gerekirse avukata danışın.'

export const MAX_TOTAL_CHARS = 12000

export type CategoryId = 'tuketici' | 'kamu' | 'kisisel-veri' | 'is-okul'

export const CATEGORIES: { id: CategoryId | 'rehber'; label: string }[] = [
  { id: 'tuketici', label: 'Tüketici' },
  { id: 'kamu', label: 'Kamu' },
  { id: 'kisisel-veri', label: 'Kişisel veri' },
  { id: 'is-okul', label: 'İş ve okul' },
  { id: 'rehber', label: 'Rehber' },
]

export const fieldSchema = z.object({
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'email', 'tel', 'date', 'tckn', 'number', 'select']),
  required: z.boolean(),
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  hint: z.string().optional(),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
})
export type Field = Omit<z.infer<typeof fieldSchema>, 'type'> & { type: FieldType }

export type Values = Record<string, string>

export interface Ctx {
  /** Trimmed single-line value, or a "[Label]" placeholder when empty. */
  v(id: string): string
  has(id: string): boolean
  raw(id: string): string
  /** Long-formatted date, or a "[Label]" placeholder. */
  date(id: string): string
  /** Non-empty lines of a free-text field; one placeholder paragraph when empty. */
  paragraphs(id: string): string[]
  /** Label of the selected option of a select field. */
  option(id: string): string
  law(id: string): string
  /** Duration of the template's merci, e.g. "30 iş günü". */
  sure(id: string): string
  /** Monetary limit as a number (for comparisons). */
  sinirDeger(id: string): number
  /** Monetary limit of the template's merci, e.g. "186.000 TL". */
  sinir(id: string): string
  /** Numeric value of a number field, or null. */
  num(id: string): number | null
}

export interface Reminder {
  /** Field holding the start date. */
  fromField: string
  /** `sureler[].id` of the template's merci. */
  sureId: string
  title: string
}

export interface TemplateDef {
  slug: string
  title: string
  category: CategoryId
  description: string
  fields: Field[]
  muhatap(c: Ctx): string[]
  konu(c: Ctx): string
  body(c: Ctx): string[]
  ekler(c: Ctx): string[]
  where: { merciId: string }
  faq: { q: string; a: string }[]
  related: string[]
  reminders?: Reminder[]
}

/** Validates the data part of a definition (functions are checked by tests). */
export const templateMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(3),
  category: z.enum(['tuketici', 'kamu', 'kisisel-veri', 'is-okul']),
  description: z.string().min(20).max(300),
  fields: z.array(fieldSchema).min(1),
  where: z.object({ merciId: z.string().min(1) }),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(10) })).min(2),
  related: z.array(z.string()),
  reminders: z
    .array(z.object({ fromField: z.string(), sureId: z.string(), title: z.string() }))
    .optional(),
})

/** Sender / date fields shared by every template. */
export const COMMON_FIELDS: Field[] = [
  {
    id: 'adSoyad',
    label: 'Ad Soyad',
    type: 'text',
    required: true,
    step: 1,
    maxLength: 120,
    placeholder: 'Örnek: Ayşe Yılmaz',
  },
  {
    id: 'tckn',
    label: 'T.C. Kimlik No',
    type: 'tckn',
    required: false,
    step: 1,
    hint: 'Gerekmedikçe yazmayın. Kurum sizi başka bir bilgiyle tanıyabiliyorsa boş bırakın.',
  },
  {
    id: 'adres',
    label: 'Adres',
    type: 'textarea',
    required: true,
    step: 1,
    maxLength: 400,
    hint: 'Cevabın gönderileceği açık adres.',
  },
  {
    id: 'telefon',
    label: 'Telefon',
    type: 'tel',
    required: false,
    step: 1,
    placeholder: '0532 123 45 67',
  },
  {
    id: 'eposta',
    label: 'E-posta',
    type: 'email',
    required: false,
    step: 1,
    placeholder: 'ad@ornek.com',
  },
  { id: 'tarih', label: 'Tarih', type: 'date', required: true, step: 1 },
]

export interface Letter {
  tarih: string
  muhatap: string[]
  konu: string
  paragraflar: string[]
  kapanis: string
  imza: string
  iletisim: string[]
  ekler: string[]
  uyari: string
}

const mevzuat: Mevzuat[] = mevzuatListSchema.parse(mevzuatJson)
const mevzuatById = new Map(mevzuat.map((m) => [m.id, m]))

export const merciler: Merci[] = merciListSchema.parse(merciJson)
export const merciById = new Map(merciler.map((m) => [m.id, m]))

const UNIT: Record<Sure['birim'], string> = {
  gun: 'gün',
  'is-gunu': 'iş günü',
  ay: 'ay',
  yil: 'yıl',
}
export const formatSure = (s: Sure): string => `${s.deger} ${UNIT[s.birim]}`
export const formatTl = (n: number): string => `${n.toLocaleString('tr-TR')} TL`

function lookupSure(merciId: string, rawId: string): Sure {
  const [m, id] = rawId.includes('/') ? rawId.split('/') : [merciId, rawId]
  const s = merciById.get(m ?? merciId)?.sureler.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown sure ${rawId}`)
  return s
}
function lookupSinir(merciId: string, id: string): number {
  const v = merciById.get(merciId)?.parasalSinirlar.find((x) => x.id === id)?.tutarTl
  if (v == null) throw new Error(`Unknown sinir ${merciId}/${id}`)
  return v
}

/** Replaces {{sure:id}}, {{sure:merci/id}} and {{sinir:id}} tokens with values from the merci data. */
export function resolveTokens(def: Pick<TemplateDef, 'where'>, text: string): string {
  return text
    .replace(/\{\{sure:([\w/-]+)\}\}/g, (_m, id: string) =>
      formatSure(lookupSure(def.where.merciId, id)),
    )
    .replace(/\{\{sinir:([\w-]+)\}\}/g, (_m, id: string) =>
      formatTl(lookupSinir(def.where.merciId, id)),
    )
}

export const allFields = (def: TemplateDef): Field[] => [...COMMON_FIELDS, ...def.fields]

export function makeCtx(def: TemplateDef, values: Values): Ctx {
  const fields = new Map(allFields(def).map((f) => [f.id, f]))
  const label = (id: string): string => fields.get(id)?.label ?? id
  const raw = (id: string): string => (values[id] ?? '').trim()
  const ph = (id: string): string => `[${label(id)}]`
  return {
    raw,
    has: (id) => raw(id) !== '',
    v: (id) => (raw(id) === '' ? ph(id) : raw(id).replace(/\s*\n\s*/g, ' ')),
    date: (id) => (raw(id) === '' ? ph(id) : (formatLongDate(raw(id)) ?? ph(id))),
    paragraphs: (id) => {
      const parts = raw(id)
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      return parts.length > 0 ? parts : [ph(id)]
    },
    option: (id) => {
      const o = fields.get(id)?.options?.find((x) => x.value === raw(id))
      return o ? o.label : ph(id)
    },
    law: (id) => {
      const m = mevzuatById.get(id)
      if (!m) throw new Error(`Unknown mevzuat id: ${id}`)
      return m.atif
    },
    sure: (id) => formatSure(lookupSure(def.where.merciId, id)),
    sinir: (id) => formatTl(lookupSinir(def.where.merciId, id)),
    sinirDeger: (id) => lookupSinir(def.where.merciId, id),
    num: (id) => {
      const r = raw(id).replace(',', '.')
      return /^\d+(\.\d+)?$/.test(r) ? Number(r) : null
    },
  }
}

export function renderLetter(def: TemplateDef, values: Values): Letter {
  const c = makeCtx(def, values)
  const iletisim = [`Adres: ${c.v('adres')}`]
  if (c.has('tckn')) iletisim.unshift(`T.C. Kimlik No: ${c.raw('tckn')}`)
  if (c.has('telefon')) iletisim.push(`Telefon: ${c.raw('telefon')}`)
  if (c.has('eposta')) iletisim.push(`E-posta: ${c.raw('eposta')}`)
  return {
    tarih: c.date('tarih'),
    muhatap: def.muhatap(c),
    konu: def.konu(c),
    paragraflar: def.body(c),
    kapanis: 'Saygılarımla,',
    imza: c.v('adSoyad'),
    iletisim,
    ekler: def.ekler(c),
    uyari: UYARI,
  }
}

export function letterToText(l: Letter): string {
  const lines: string[] = [l.tarih, '', ...l.muhatap, '', `Konu: ${l.konu}`, '']
  l.paragraflar.forEach((p) => lines.push(p, ''))
  lines.push(l.kapanis, l.imza, '', ...l.iletisim)
  if (l.ekler.length > 0) {
    lines.push('', 'Ekler:')
    l.ekler.forEach((e, i) => lines.push(`${i + 1}. ${e}`))
  }
  lines.push('', `Not: ${l.uyari}`)
  return lines.join('\n')
}

export const letterLength = (l: Letter): number => letterToText(l).length

/** Splits text so bracketed placeholders can be styled. */
export const PLACEHOLDER_RE = /(\[[^\]\n]+\])/g
