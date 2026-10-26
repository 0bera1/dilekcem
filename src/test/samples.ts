import { allFields, type TemplateDef, type Values } from '../templates/engine'

/** Deterministic sample answers for every field of a template. */
export function sampleValues(def: TemplateDef, overrides: Values = {}): Values {
  const out: Values = {}
  for (const f of allFields(def)) {
    switch (f.type) {
      case 'date':
        out[f.id] = '2026-03-10'
        break
      case 'number':
        out[f.id] = '1250'
        break
      case 'email':
        out[f.id] = 'ayse@ornek.com'
        break
      case 'tel':
        out[f.id] = '0532 123 45 67'
        break
      case 'tckn':
        out[f.id] = '10000000146'
        break
      case 'select':
        out[f.id] = f.options?.[0]?.value ?? ''
        break
      case 'textarea':
        out[f.id] =
          'Birinci paragraf: şikâyet konusu ığüşöçİ karakterleriyle yazıldı.\nİkinci paragraf: talep açıklaması.'
        break
      default:
        out[f.id] =
          f.id === 'adSoyad' ? 'Ayşe Yılmaz' : f.id === 'plaka' ? '06 ABC 123' : `Örnek ${f.label}`
    }
  }
  out.adSoyad = 'Ayşe Yılmaz'
  out.adres = 'Örnek Mah. Deneme Sok. No: 5 Çankaya / Ankara'
  return { ...out, ...overrides }
}
