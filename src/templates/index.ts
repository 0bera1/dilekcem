import kararAgaciJson from '../data/karar-agaci.json'
import type { KararAgaci } from '../data/schema'
import { compareTr, includesTr } from '../lib/tr'
import abonelikIptali from './tuketici/abonelik-iptali'
import ayipliUrun from './tuketici/ayipli-urun'
import bankaUcretItirazi from './tuketici/banka-ucret-itirazi'
import gecTeslimat from './tuketici/gec-teslimat'
import kargoHasari from './tuketici/kargo-hasari'
import hakemHeyeti from './tuketici/tuketici-hakem-heyeti-basvurusu'
import urunIadesiCayma from './tuketici/urun-iadesi-cayma'
import belediyeSikayeti from './kamu/belediye-sikayeti'
import bilgiEdinme from './kamu/bilgi-edinme-basvurusu'
import cimerBasvurusu from './kamu/cimer-basvurusu'
import trafikCezasi from './kamu/trafik-cezasi-itirazi'
import kvkkBilgiTalebi from './kisisel-veri/kvkk-bilgi-talebi'
import kvkkSilme from './kisisel-veri/kvkk-silme-yok-etme-talebi'
import ticariIleti from './kisisel-veri/ticari-ileti-onay-geri-cekme'
import belgeTalebi from './is-okul/belge-talebi'
import istifa from './is-okul/istifa-dilekcesi'
import izinTalebi from './is-okul/izin-talebi'
import mazeret from './is-okul/mazeret-dilekcesi'
import { merciById, type CategoryId, type TemplateDef } from './engine'

export const templates: TemplateDef[] = [
  abonelikIptali,
  urunIadesiCayma,
  ayipliUrun,
  gecTeslimat,
  kargoHasari,
  bankaUcretItirazi,
  hakemHeyeti,
  cimerBasvurusu,
  bilgiEdinme,
  trafikCezasi,
  belediyeSikayeti,
  kvkkBilgiTalebi,
  kvkkSilme,
  ticariIleti,
  izinTalebi,
  istifa,
  mazeret,
  belgeTalebi,
]

const bySlug = new Map(templates.map((t) => [t.slug, t]))

export const getTemplate = (slug: string): TemplateDef | undefined => bySlug.get(slug)

export const templatesByCategory = (cat: CategoryId): TemplateDef[] =>
  templates.filter((t) => t.category === cat)

export const searchTemplates = (
  query: string,
  cat: CategoryId | 'hepsi' = 'hepsi',
): TemplateDef[] =>
  templates
    .filter((t) => cat === 'hepsi' || t.category === cat)
    .filter((t) => query.trim() === '' || includesTr(`${t.title} ${t.description}`, query))
    .sort((a, b) => compareTr(a.title, b.title))

/** A template is "verified" only when its merci data is verified. */
export const isVerified = (t: TemplateDef): boolean =>
  merciById.get(t.where.merciId)?.verified === true

export const kararAgaci = kararAgaciJson as unknown as KararAgaci
