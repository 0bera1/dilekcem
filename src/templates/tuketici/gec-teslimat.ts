import type { TemplateDef } from '../engine'
import { dateField, selectField, textField, upperName } from '../helpers'

const gecTeslimat: TemplateDef = {
  slug: 'gec-teslimat',
  title: 'Geç teslimat dilekçesi',
  category: 'tuketici',
  description:
    'Siparişiniz taahhüt edilen sürede teslim edilmediyse teslimat veya sözleşmeyi feshedip bedel iadesi talebinizi yazılı bildirin.',
  fields: [
    textField('firma', 'Satıcı firma adı', { step: 2 }),
    textField('urun', 'Sipariş edilen ürün'),
    textField('siparisNo', 'Sipariş numarası', { required: false }),
    dateField('siparisTarihi', 'Sipariş tarihi'),
    dateField('taahhutTarihi', 'Taahhüt edilen teslim tarihi', { required: false }),
    selectField('talep', 'Talebiniz', [
      { value: 'teslim', label: 'siparişimin en kısa sürede teslim edilmesini' },
      { value: 'fesih', label: 'sözleşmeyi feshettiğimi bildirir, ödediğim bedelin iadesini' },
    ]),
  ],
  muhatap: (c) => [upperName(c, 'firma'), 'Müşteri Hizmetleri'],
  konu: (c) => `Geç teslimat${c.has('siparisNo') ? ` (Sipariş no: ${c.v('siparisNo')})` : ''}`,
  body: (c) => [
    `${c.date('siparisTarihi')} tarihinde firmanızdan sipariş verdim ve ödemesini yaptım.\nÜrün: ${c.v('urun')}`,
    c.has('taahhutTarihi')
      ? `Siparişin ${c.date('taahhutTarihi')} tarihinde teslim edilmesi taahhüt edilmiş olmasına rağmen ürün bugüne kadar bana ulaşmamıştır.`
      : 'Ürün, taahhüt edilen süre içinde bana ulaşmamıştır.',
    `${c.law('tkhk-48')} uyarınca mal satışlarında teslim süresi, her hâlükârda ${c.sure('teslim')} ile sınırlıdır; bu süre içinde edimini yerine getirmeyen satıcıya karşı tüketici sözleşmeyi feshedebilir.`,
    `Bu nedenle ${c.option('talep')} talep ederim.`,
    'Talebimin yerine getirilmemesi hâlinde tüketici hakem heyetine veya tüketici mahkemesine başvuracağımı bilgilerinize sunarım.',
  ],
  ekler: () => ['Sipariş onayı ve ödeme belgesi'],
  where: { merciId: 'satici-firma' },
  faq: [
    {
      q: 'Sipariş en geç kaç günde teslim edilmelidir?',
      a: 'Kişiye özel hazırlanan mallar hariç, mal satışlarında teslim süresi her hâlükârda {{sure:teslim}} ile sınırlıdır. Satıcı bu süre içinde teslim etmezse tüketici sözleşmeyi feshedebilir.',
    },
    {
      q: 'Fesih hâlinde ödemem ne zaman iade edilir?',
      a: 'Bedelin iade süresi ve usulü kanun ile Mesafeli Sözleşmeler Yönetmeliği hükümlerine tabidir. Ayrıntı için güncel yönetmelik metnine bakın.',
    },
  ],
  related: ['urun-iadesi-cayma', 'ayipli-urun', 'tuketici-hakem-heyeti-basvurusu'],
}

export default gecTeslimat
