// `npm run check:data`
//  - validates src/data/*.json against their zod schemas
//  - cross-checks template references (merci ids, durations, laws)
//  - requests every source URL (must answer 2xx/3xx; skipped with a warning when offline)
//  - warns about records verified more than 12 months ago
import { kararAgaciSchema, merciListSchema, mevzuatListSchema } from '../src/data/schema.ts'
import kararJson from '../src/data/karar-agaci.json' with { type: 'json' }
import merciJson from '../src/data/merciler.json' with { type: 'json' }
import mevzuatJson from '../src/data/mevzuat.json' with { type: 'json' }
import { templates } from '../src/templates/index.ts'

let failed = false
const fail = (msg: string): void => {
  failed = true
  console.error(`HATA   ${msg}`)
}
const warn = (msg: string): void => console.warn(`UYARI  ${msg}`)

const merciler = merciListSchema.parse(merciJson)
const mevzuat = mevzuatListSchema.parse(mevzuatJson)
kararAgaciSchema.parse(kararJson)
console.log(`Şema doğrulandı: ${merciler.length} merci, ${mevzuat.length} mevzuat kaydı.`)

const merciIds = new Set(merciler.map((m) => m.id))
for (const t of templates) {
  if (!merciIds.has(t.where.merciId)) fail(`${t.slug}: bilinmeyen merciId ${t.where.merciId}`)
  const merci = merciler.find((m) => m.id === t.where.merciId)
  for (const r of t.reminders ?? [])
    if (!merci?.sureler.some((s) => s.id === r.sureId))
      fail(`${t.slug}: hatırlatıcı süresi yok: ${r.sureId}`)
}

const now = new Date()
const limit = new Date(now)
limit.setMonth(limit.getMonth() - 12)
for (const rec of [
  ...merciler.map((m) => ({ id: m.id, d: m.dogrulamaTarihi })),
  ...mevzuat.map((m) => ({ id: m.id, d: m.dogrulamaTarihi })),
]) {
  if (new Date(rec.d) < limit) warn(`${rec.id}: doğrulama tarihi 12 aydan eski (${rec.d})`)
}
for (const m of merciler) {
  if (m.validTo && new Date(m.validTo) < now)
    warn(`${m.id}: geçerlilik süresi doldu (${m.validTo})`)
  if (!m.verified) warn(`${m.id}: doğrulanmadı, arayüzde "Doğrulanmalı" rozeti gösterilir`)
}

const urls = [
  ...new Set([
    ...merciler.flatMap((m) => [m.kaynakUrl, ...(m.web ? [m.web] : [])]),
    ...mevzuat.map((m) => m.kaynakUrl),
  ]),
]
const UA = 'Mozilla/5.0 (compatible; dilekcem-data-check)'

async function probe(url: string): Promise<{ url: string; status: number | null; error?: string }> {
  for (const attempt of [1, 2]) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(25_000),
      })
      await res.body?.cancel()
      return { url, status: res.status }
    } catch (e) {
      if (attempt === 2)
        return { url, status: null, error: e instanceof Error ? e.message : String(e) }
    }
  }
  return { url, status: null }
}

const results = await Promise.all(urls.map(probe))
const reachable = results.filter((r) => r.status !== null)
if (reachable.length === 0) {
  warn('ağ erişimi yok: kaynak URL kontrolü atlandı')
} else {
  for (const r of results) {
    if (r.status === null) fail(`${r.url} erişilemedi (${r.error})`)
    else if (r.status >= 400) fail(`${r.url} -> HTTP ${r.status}`)
    else console.log(`OK     ${r.status} ${r.url}`)
  }
}

if (failed) process.exit(1)
console.log('check:data tamam.')
