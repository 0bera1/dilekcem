import type { TemplateDef } from '../engine'
import { areaField, dateField, numberField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const hakemHeyeti: TemplateDef = {
  slug: 'tuketici-hakem-heyeti-basvurusu',
  title: 'Tüketici hakem heyeti başvuru dilekçesi',
  category: 'tuketici',
  description:
    'Satıcı veya hizmet sağlayıcıyla yaşadığınız uyuşmazlığı il ya da ilçe tüketici hakem heyetine taşıyın. Hazır başvuru dilekçesi ve parasal sınır bilgisi.',
  fields: [
    textField('heyet', 'Heyetin il veya ilçesi', { step: 2, placeholder: 'Örnek: Ankara Çankaya' }),
    textField('karsiFirma', 'Karşı taraf (firma) adı', { step: 2 }),
    textField('karsiAdres', 'Karşı tarafın adresi', { required: false }),
    areaField('olay', 'Olayın özeti', {
      hint: 'Ne zaman, ne oldu? Her paragrafı ayrı satıra yazın.',
    }),
    dateField('onceBasvuru', 'Firmaya daha önce başvurduğunuz tarih', { required: false }),
    areaField('talep', 'Talebiniz', { maxLength: 800 }),
    numberField('deger', 'Uyuşmazlığın değeri (TL)', {
      hint: 'Parasal sınırı aşan uyuşmazlıklar heyete götürülemez.',
    }),
  ],
  muhatap: (c) => [`${upperTr(c.v('heyet'))} TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞI`],
  konu: (c) => `Tüketici uyuşmazlığı başvurusu (Karşı taraf: ${c.v('karsiFirma')})`,
  body: (c) => {
    const deger = c.num('deger')
    const sinirMetni = c.sinir('sinir-2026')
    const out = [
      `Karşı taraf: ${c.v('karsiFirma')}${c.has('karsiAdres') ? `\nAdresi: ${c.v('karsiAdres')}` : ''}`,
      'Uyuşmazlığa konu olay şöyledir:',
      ...c.paragraphs('olay'),
    ]
    if (c.has('onceBasvuru')) {
      out.push(
        `Karşı tarafa ${c.date('onceBasvuru')} tarihinde yazılı olarak başvurdum, ancak talebim karşılanmamıştır.`,
      )
    }
    out.push('Talebim:', ...c.paragraphs('talep'))
    if (deger === null) {
      out.push(`Uyuşmazlığın değeri: ${c.v('deger')}`)
    } else if (deger >= c.sinirDeger('sinir-2026')) {
      out.push(
        `[Dikkat: Uyuşmazlık değeri ${deger.toLocaleString('tr-TR')} TL. Hakem heyeti için geçerli parasal sınır ${sinirMetni} ve üzeri uyuşmazlıklar heyette karara bağlanamaz; bu durumda tüketici mahkemesine başvurun. Bu uyarıyı silin.]`,
      )
    } else {
      out.push(
        `Uyuşmazlığın değeri ${deger.toLocaleString('tr-TR')} TL olup, ${sinirMetni} olan parasal sınırın altındadır.`,
      )
    }
    out.push(
      `${c.law('tkhk-68')} uyarınca başvurumun incelenerek karara bağlanmasını saygılarımla arz ederim.`,
    )
    return out
  },
  ekler: () => [
    'Fatura veya satış belgesi',
    'Karşı tarafa yapılan başvuru ve varsa cevabı',
    'Olayı gösteren diğer belgeler',
    'Kimlik fotokopisi',
  ],
  where: { merciId: 'tuketici-hakem-heyeti' },
  faq: [
    {
      q: 'Tüketici hakem heyetine hangi uyuşmazlıklar götürülebilir?',
      a: 'Değeri parasal sınırın altındaki tüketici uyuşmazlıkları. 2026 yılı için sınır: {{sinir:sinir-2026}}. Bu tutar ve üzeri uyuşmazlıklar heyette karara bağlanamaz.',
    },
    {
      q: 'Nereye başvurulur?',
      a: 'Tüketicinin yerleşim yerindeki veya işlemin yapıldığı yerdeki heyete. Başvuru elden, posta ile veya e-Devlet üzerinden Tüketici Bilgi Sistemi (TÜBİS) ile yapılabilir. Heyet bulunmayan ilçelerde kaymakamlığa başvurulur.',
    },
    {
      q: 'Önce firmaya başvurmak zorunlu mu?',
      a: 'Firmaya yazılı başvuru kanunen şart koşulmasa da uyuşmazlığı belgelemek ve heyet incelemesini kolaylaştırmak için önerilir.',
    },
  ],
  related: ['ayipli-urun', 'urun-iadesi-cayma', 'banka-ucret-itirazi'],
}

export default hakemHeyeti
