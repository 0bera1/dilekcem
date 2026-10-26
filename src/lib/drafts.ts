import { z } from 'zod'
import { getTemplate } from '../templates'
import type { TemplateDef, Values } from '../templates/engine'
import { readStorage, removeStorage, writeStorage } from './storage'

export const DRAFTS_KEY = 'dilekcem:drafts'
export const DRAFTS_ENABLED_KEY = 'dilekcem:drafts-enabled'

/** Fields never written to storage, even when drafts are on. */
const NEVER_STORED = new Set(['tckn'])

export const draftSchema = z.object({
  id: z.string().min(1).max(64),
  slug: z.string().min(1).max(100),
  title: z.string().max(200),
  savedAt: z.string().max(40),
  values: z.record(z.string().max(100), z.string().max(5000)),
})
export type Draft = z.infer<typeof draftSchema>

const fileSchema = z.object({ version: z.literal(1), drafts: z.array(draftSchema).max(200) })

export const draftsEnabled = (): boolean => readStorage(DRAFTS_ENABLED_KEY) === '1'

export function setDraftsEnabled(on: boolean): void {
  if (on) writeStorage(DRAFTS_ENABLED_KEY, '1')
  else removeStorage(DRAFTS_ENABLED_KEY)
}

export function loadDrafts(): Draft[] {
  const raw = readStorage(DRAFTS_KEY)
  if (!raw) return []
  try {
    const parsed = z.array(draftSchema).safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data.filter((d) => getTemplate(d.slug)) : []
  } catch {
    return []
  }
}

export const storeDrafts = (list: Draft[]): void => writeStorage(DRAFTS_KEY, JSON.stringify(list))

export function clearDrafts(): void {
  removeStorage(DRAFTS_KEY)
}

export function makeDraft(def: TemplateDef, values: Values, now: Date, id: string): Draft {
  const kept: Values = {}
  for (const [k, v] of Object.entries(values))
    if (!NEVER_STORED.has(k) && v.trim() !== '') kept[k] = v
  return { id, slug: def.slug, title: def.title, savedAt: now.toISOString(), values: kept }
}

export const exportDrafts = (list: Draft[]): string =>
  JSON.stringify({ version: 1, drafts: list }, null, 2)

export type ImportResult = { ok: true; drafts: Draft[] } | { ok: false; message: string }

export function parseImport(text: string): ImportResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, message: 'Dosya geçerli bir JSON değil.' }
  }
  const parsed = fileSchema.safeParse(json)
  if (!parsed.success) return { ok: false, message: 'Dosya Dilekçem taslak biçiminde değil.' }
  const known = parsed.data.drafts.filter((d) => getTemplate(d.slug))
  return { ok: true, drafts: known }
}

/** Merges by id; imported drafts win. */
export function mergeDrafts(current: Draft[], incoming: Draft[]): Draft[] {
  const map = new Map(current.map((d) => [d.id, d]))
  for (const d of incoming) map.set(d.id, d)
  return [...map.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}
