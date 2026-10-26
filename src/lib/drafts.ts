import { getTemplate } from '../templates'
import type { TemplateDef, Values } from '../templates/engine'
import { readStorage, removeStorage, writeStorage } from './storage'

export const DRAFTS_KEY = 'dilekcem:drafts'
export const DRAFTS_ENABLED_KEY = 'dilekcem:drafts-enabled'

/** Fields never written to storage, even when drafts are on. */
const NEVER_STORED = new Set(['tckn'])

export interface Draft {
  id: string
  slug: string
  title: string
  savedAt: string
  values: Record<string, string>
}

const MAX_DRAFTS = 200

const isString = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max

/** Strict shape check for data read from storage or an imported file. */
function isDraft(v: unknown): v is Draft {
  if (typeof v !== 'object' || v === null) return false
  const d = v as Record<string, unknown>
  if (!isString(d.id, 64) || d.id === '' || !isString(d.slug, 100) || d.slug === '') return false
  if (!isString(d.title, 200) || !isString(d.savedAt, 40)) return false
  if (typeof d.values !== 'object' || d.values === null || Array.isArray(d.values)) return false
  return Object.entries(d.values).every(([k, val]) => isString(k, 100) && isString(val, 5000))
}

const isDraftList = (v: unknown): v is Draft[] =>
  Array.isArray(v) && v.length <= MAX_DRAFTS && v.every(isDraft)

export const draftsEnabled = (): boolean => readStorage(DRAFTS_ENABLED_KEY) === '1'

export function setDraftsEnabled(on: boolean): void {
  if (on) writeStorage(DRAFTS_ENABLED_KEY, '1')
  else removeStorage(DRAFTS_ENABLED_KEY)
}

export function loadDrafts(): Draft[] {
  const raw = readStorage(DRAFTS_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return isDraftList(parsed) ? parsed.filter((d) => getTemplate(d.slug)) : []
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
  const file = json as { version?: unknown; drafts?: unknown } | null
  if (!file || file.version !== 1 || !isDraftList(file.drafts)) {
    return { ok: false, message: 'Dosya Dilekçem taslak biçiminde değil.' }
  }
  const known = file.drafts.filter((d) => getTemplate(d.slug))
  return { ok: true, drafts: known }
}

/** Merges by id; imported drafts win. */
export function mergeDrafts(current: Draft[], incoming: Draft[]): Draft[] {
  const map = new Map(current.map((d) => [d.id, d]))
  for (const d of incoming) map.set(d.id, d)
  return [...map.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}
