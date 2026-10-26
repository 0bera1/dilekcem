import type { TemplateDef } from '../engine'
import { areaField, dateField, selectField, textField, upperName } from '../helpers'

const ayipliUrun: TemplateDef = {
  slug: 'ayipli-urun',
  title: 'Ayıplı ürün şikâyet dilekçesi',
  category: 'tuketici',
  description:
    'Arızalı veya ayıplı çıkan ürün için onarım, değişim, indirim ya da iade talebinizi satıcıya yazılı olarak bildirin. Hazır şikâyet dilekçesi.',
  fields: [
    textField('firma', 'Satıcı firma adı', { step: 2 }),
    textField('urun', 'Ürün adı ve modeli'),
    textField('siparisNo', 'Fatura veya sipariş numarası', { required: false }),
    dateField('teslimTarihi', 'Teslim aldığınız tarih'),
    areaField('ayip', 'Ayıbın açıklaması', {
      hint: 'Ne zaman, nasıl ortaya çıktı? Kısa ve somut yazın.',
    }),
    selectField('talep', 'Talebiniz', [
      { value: 'onarim', label: 'ürünün ücretsiz onarılması' },
      { value: 'degisim', label: 'ürünün ayıpsız bir misli ile değiştirilmesi' },
      { value: 'indirim', label: 'ayıp oranında bedelden indirim yapılması' },
      { value: 'donme', label: 'sözleşmeden dönüyorum; ürün bedelinin iadesi' },
    ]),
  ],
  muhatap: (c) => [upperName(c, 'firma'), 'Müşteri Hizmetleri'],
  konu: (c) =>
    `Ayıplı ürün hakkında talep${c.has('siparisNo') ? ` (Fatura/sipariş no: ${c.v('siparisNo')})` : ''}`,
  body: (c) => {
    const talep = c.raw('talep')
    const out = [
      `${c.date('teslimTarihi')} tarihinde teslim aldığım ürünün ayıplı olduğunu tespit ettim.\nÜrün: ${c.v('urun')}`,
      'Ayıbın niteliği şöyledir:',
      ...c.paragraphs('ayip'),
      `${c.law('tkhk-11')} uyarınca seçimlik hakkım olarak şu talepte bulunuyorum: ${c.option('talep')}.`,
    ]
    if (talep === 'onarim' || talep === 'degisim') {
      out.push(
        `Bu talebin, kanunda öngörülen azami ${c.sure('onarim')} içinde yerine getirilmesini rica ederim.`,
      )
    } else {
      out.push('Ödemiş olduğum bedelin veya indirim tutarının derhâl iade edilmesini rica ederim.')
    }
    out.push(
      'Talebimin karşılanmaması hâlinde tüketici hakem heyetine veya tüketici mahkemesine başvuracağımı bilgilerinize sunarım.',
    )
    return out
  },
  ekler: () => ['Fatura veya satış belgesi', 'Ayıbı gösteren fotoğraf veya kayıtlar'],
  where: { merciId: 'satici-firma' },
  reminders: [
    { fromField: 'tarih', sureId: 'onarim', title: 'Onarım veya değişim süresi doluyor' },
  ],
  faq: [
    {
      q: 'Ayıplı ürün için ne kadar süre içinde başvurabilirim?',
      a: 'Ayıplı maldan sorumluluk, teslim tarihinden itibaren zamanaşımına tabidir (süre: {{sure:zamanasimi}}). Ayıbı fark ettiğinizde gecikmeden bildirmeniz delil açısından önemlidir.',
    },
    {
      q: 'Onarım veya değişim talebi ne kadar sürede yerine getirilmelidir?',
      a: 'Kanuna göre azami {{sure:onarim}} içinde. Bazı mallar için yönetmelikte daha kısa süreler olabilir. Süre dolarsa diğer seçimlik haklarınızı kullanabilirsiniz.',
    },
    {
      q: 'Hangi talebi seçmeliyim?',
      a: 'Kanun dört seçimlik hak tanır: sözleşmeden dönme, bedelden indirim, ücretsiz onarım ve ayıpsız misli ile değiştirme. Seçim sizindir; satıcı seçtiğiniz talebi yerine getirmekle yükümlüdür.',
    },
  ],
  related: ['urun-iadesi-cayma', 'tuketici-hakem-heyeti-basvurusu', 'gec-teslimat'],
}

export default ayipliUrun
