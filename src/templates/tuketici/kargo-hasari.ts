import type { TemplateDef } from '../engine'
import { areaField, dateField, numberField, selectField, textField, upperName } from '../helpers'

const kargoHasari: TemplateDef = {
  slug: 'kargo-hasari',
  title: 'Kargo hasarı ve kayıp bildirimi dilekçesi',
  category: 'tuketici',
  description:
    'Kargoda hasar gören veya kaybolan gönderi için kargo firmasına zarar tazmini talebi. Takip numarası ve hasar bilgisiyle hazır dilekçe.',
  fields: [
    textField('firma', 'Kargo firması', { step: 2 }),
    textField('takipNo', 'Gönderi takip numarası'),
    dateField('gonderiTarihi', 'Gönderi tarihi', { required: false }),
    dateField('teslimTarihi', 'Teslim tarihi', { required: false, hint: 'Kayıp ise boş bırakın.' }),
    textField('icerik', 'Gönderinin içeriği'),
    areaField('hasar', 'Hasarın veya kaybın açıklaması'),
    numberField('zarar', 'Zarar tutarı (TL)', {
      required: false,
      hint: 'Ürünün değeri. Yalnızca rakam yazın.',
    }),
    selectField(
      'tutanak',
      'Hasar tespit tutanağı',
      [
        { value: 'var', label: 'Teslim anında tutanak düzenlendi' },
        { value: 'yok', label: 'Tutanak düzenlenmedi' },
      ],
      { required: false },
    ),
  ],
  muhatap: (c) => [upperName(c, 'firma'), 'Müşteri Hizmetleri / Hasar Birimi'],
  konu: (c) => `Gönderi zararı hakkında talep (Takip no: ${c.v('takipNo')})`,
  body: (c) => {
    const out = [
      `Takip numarası ${c.v('takipNo')} olan gönderiye ilişkin başvuruda bulunuyorum.\nGönderinin içeriği: ${c.v('icerik')}${c.has('gonderiTarihi') ? `\nGönderi tarihi: ${c.date('gonderiTarihi')}` : ''}${c.has('teslimTarihi') ? `\nTeslim tarihi: ${c.date('teslimTarihi')}` : ''}`,
      'Gönderide meydana gelen zarar şöyledir:',
      ...c.paragraphs('hasar'),
    ]
    if (c.raw('tutanak') === 'var')
      out.push('Teslim sırasında hasar tespit tutanağı düzenlenmiştir; tutanak ektedir.')
    const z = c.num('zarar')
    out.push(
      z !== null
        ? `Gönderinin değeri ${z.toLocaleString('tr-TR')} TL olup, uğradığım zararın bu tutar üzerinden tazmin edilmesini talep ederim.`
        : 'Uğradığım zararın tazmin edilmesini talep ederim.',
    )
    out.push(
      'Başvurumun incelenmesini ve sonucun yazılı olarak bildirilmesini rica ederim. Sonuç alınamaması hâlinde yasal yollara başvuracağımı bilgilerinize sunarım.',
    )
    return out
  },
  ekler: () => [
    'Hasarlı gönderinin ve ambalajın fotoğrafları',
    'Ürünün fatura veya değer belgesi',
    'Gönderi takip kaydı',
  ],
  where: { merciId: 'kargo-firmasi' },
  faq: [
    {
      q: 'Kargoyu teslim alırken ne yapmalıyım?',
      a: 'Paketi görevli yanında kontrol edin; hasar varsa teslim almadan veya teslim anında tutanak düzenletin. Hasarı fotoğrafla belgelemek ispatı kolaylaştırır.',
    },
    {
      q: 'Hasar bildirimi için süre var mı?',
      a: 'Kargo firmalarının hasar bildirim süreleri taşıma sözleşmesine ve ilgili mevzuata göre değişir. Bu sitedeki veri bu süreyi doğrulayamadığı için kesin bir süre verilmemiştir; en kısa sürede başvurun.',
    },
  ],
  related: ['ayipli-urun', 'tuketici-hakem-heyeti-basvurusu', 'cimer-basvurusu'],
}

export default kargoHasari
