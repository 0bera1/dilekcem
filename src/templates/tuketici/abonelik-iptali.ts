import type { TemplateDef } from '../engine'
import { selectField, textField, dateField, upperName } from '../helpers'

const abonelikIptali: TemplateDef = {
  slug: 'abonelik-iptali',
  title: 'Abonelik iptali dilekçesi',
  category: 'tuketici',
  description:
    'İnternet, GSM, dijital platform, spor salonu veya benzeri aboneliğinizi iptal etmek için hazır dilekçe. Alanları doldurun, PDF veya Word olarak indirin.',
  fields: [
    textField('firma', 'Firma adı', { step: 2, placeholder: 'Örnek: Örnek İletişim A.Ş.' }),
    textField('hizmet', 'İptal edilecek hizmet', {
      placeholder: 'Örnek: Sabit internet aboneliği',
    }),
    textField('aboneNo', 'Abone veya müşteri numarası', { required: false }),
    dateField('iptalTarihi', 'İptalin geçerli olmasını istediğiniz tarih', {
      required: false,
      hint: 'Boş bırakırsanız başvuru tarihi esas alınır.',
    }),
    selectField(
      'iade',
      'Peşin ödenmiş ücret iadesi',
      [
        { value: 'hayir', label: 'Gerek yok' },
        { value: 'evet', label: 'İade istiyorum' },
      ],
      { required: false },
    ),
  ],
  muhatap: (c) => [upperName(c, 'firma'), 'Müşteri Hizmetleri / Abonelik Birimi'],
  konu: (c) => `Abonelik iptali talebi${c.has('aboneNo') ? ` (Abone no: ${c.v('aboneNo')})` : ''}`,
  body: (c) => {
    const out = [
      `Firmanız nezdindeki aşağıda bilgileri yazılı aboneliğimi sona erdirmek istiyorum.\nHizmet: ${c.v('hizmet')}${c.has('aboneNo') ? `\nAbone numarası: ${c.v('aboneNo')}` : ''}`,
      c.has('iptalTarihi')
        ? `Aboneliğimin ${c.date('iptalTarihi')} tarihi itibarıyla iptal edilmesini talep ederim.`
        : 'Aboneliğimin bu başvurunun tarihi itibarıyla iptal edilmesini talep ederim.',
      'Bu tarihten sonra adıma fatura düzenlenmemesini, tanımlı otomatik ödeme talimatı varsa durdurulmasını rica ederim.',
    ]
    if (c.raw('iade') === 'evet') {
      out.push(
        'Kullanılmayan döneme ait peşin ödenmiş ücret varsa, ödemeyi yaptığım yöntemle iade edilmesini talep ederim.',
      )
    }
    out.push(
      'İptal işleminin tamamlandığını, işlem tarihi ile birlikte yazılı olarak (e-posta veya mesajla) bana bildirmenizi rica ederim.',
    )
    return out
  },
  ekler: () => ['Son faturanın bir örneği'],
  where: { merciId: 'satici-firma' },
  faq: [
    {
      q: 'Abonelik iptali için nereye başvurulur?',
      a: 'Firmanın müşteri hizmetlerine, kayıt altına alınabilecek yazılı bir yolla başvurun: KEP, noter, taahhütlü posta ya da kayıtlı e-posta. Sözlü başvuru sonradan ispatı zorlaştırır.',
    },
    {
      q: 'Firma iptali kabul etmezse ne yapabilirim?',
      a: 'Önce yazılı itirazınızı saklayın. Sonuç alamazsanız uyuşmazlığın değerine göre tüketici hakem heyetine ya da tüketici mahkemesine başvurabilirsiniz. Güncel parasal sınır için "Tüketici hakem heyeti başvurusu" sayfasına bakın.',
    },
  ],
  related: ['urun-iadesi-cayma', 'tuketici-hakem-heyeti-basvurusu', 'cimer-basvurusu'],
}

export default abonelikIptali
