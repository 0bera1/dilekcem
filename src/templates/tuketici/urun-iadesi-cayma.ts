import type { TemplateDef } from '../engine'
import { dateField, selectField, textField, upperName } from '../helpers'

const urunIadesiCayma: TemplateDef = {
  slug: 'urun-iadesi-cayma',
  title: 'İnternetten alınan ürünü iade (cayma hakkı) dilekçesi',
  category: 'tuketici',
  description:
    'İnternetten veya telefonla aldığınız ürün için gerekçe göstermeden cayma hakkınızı kullanın. Hazır iade dilekçesi, PDF ve Word çıktısı.',
  fields: [
    textField('firma', 'Satıcı firma adı', { step: 2 }),
    textField('urun', 'Ürün adı ve modeli'),
    textField('siparisNo', 'Sipariş numarası', { required: false }),
    dateField('siparisTarihi', 'Sipariş tarihi'),
    dateField('teslimTarihi', 'Teslim aldığınız tarih'),
    selectField('iadeSekli', 'Bedelin iadesi', [
      { value: 'ayni', label: 'ödemeyi yaptığım yöntemle' },
      { value: 'havale', label: 'aşağıda bildirdiğim banka hesabına havale ile' },
    ]),
    textField('iban', 'IBAN', {
      required: false,
      hint: 'Yalnızca havale ile iade seçtiyseniz yazın.',
    }),
  ],
  muhatap: (c) => [upperName(c, 'firma'), 'İade ve Müşteri İlişkileri Birimi'],
  konu: (c) =>
    `Cayma hakkının kullanılması${c.has('siparisNo') ? ` (Sipariş no: ${c.v('siparisNo')})` : ''}`,
  body: (c) => {
    const out = [
      `${c.date('siparisTarihi')} tarihinde internet/uzaktan iletişim araçları ile firmanızdan sipariş verdim; ürünü ${c.date('teslimTarihi')} tarihinde teslim aldım.\nÜrün: ${c.v('urun')}${c.has('siparisNo') ? `\nSipariş numarası: ${c.v('siparisNo')}` : ''}`,
      `${c.law('tkhk-48')} uyarınca, ${c.sure('cayma')} içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkıma sahibim. Bu yazı ile söz konusu sözleşmeden cayma hakkımı kullandığımı bildiririm.`,
      'Ürünü kullanılmamış hâlde, ambalajı ve tüm aksesuarlarıyla birlikte iade etmeye hazırım. İade için kargo bilgisini veya iade kodunu bana bildirmenizi rica ederim.',
      `Ürün bedelinin ${c.option('iadeSekli')} bana iade edilmesini talep ederim.${c.raw('iadeSekli') === 'havale' ? `\nIBAN: ${c.v('iban')}` : ''}`,
    ]
    return out
  },
  ekler: () => ['Sipariş onayı veya fatura örneği'],
  where: { merciId: 'satici-firma' },
  reminders: [{ fromField: 'teslimTarihi', sureId: 'cayma', title: 'Cayma hakkı süresi bitiyor' }],
  faq: [
    {
      q: 'İnternetten aldığım ürünü kaç gün içinde iade edebilirim?',
      a: 'Mesafeli sözleşmelerde cayma süresi: {{sure:cayma}}. Bildirimin bu süre içinde satıcıya yöneltilmiş olması yeterlidir. Mal tesliminden itibaren işler.',
    },
    {
      q: 'Her ürün iade edilebilir mi?',
      a: 'Hayır. Kişiye özel hazırlanan ürünler gibi bazı sözleşmelerde cayma hakkı kullanılamaz. Ayrıntı için ilgili kanun ve yönetmelik hükümlerine ya da Ticaret Bakanlığı tüketici sayfalarına bakın.',
    },
    {
      q: 'Satıcı iadeyi kabul etmezse?',
      a: 'Cayma bildiriminizi ve yazışmaları saklayın. Uyuşmazlığın değerine göre tüketici hakem heyetine veya tüketici mahkemesine başvurabilirsiniz.',
    },
  ],
  related: ['ayipli-urun', 'gec-teslimat', 'tuketici-hakem-heyeti-basvurusu'],
}

export default urunIadesiCayma
