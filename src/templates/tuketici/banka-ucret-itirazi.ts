import type { TemplateDef } from '../engine'
import { areaField, dateField, numberField, textField, upperName } from '../helpers'

const bankaUcretItirazi: TemplateDef = {
  slug: 'banka-ucret-itirazi',
  title: 'Banka ücret ve kesinti itirazı dilekçesi',
  category: 'tuketici',
  description:
    'Hesabınızdan veya kartınızdan yapılan haksız ücret, komisyon ya da kesinti için bankaya itiraz ve iade talebi. Hazır dilekçe.',
  fields: [
    textField('banka', 'Banka adı', { step: 2 }),
    textField('urunNo', 'Hesap veya kart (son 4 hane)', {
      required: false,
      hint: 'Tam numarayı yazmayın.',
      maxLength: 4,
    }),
    textField('ucretAdi', 'Kesintinin adı', { placeholder: 'Örnek: Hesap işletim ücreti' }),
    numberField('tutar', 'Kesinti tutarı (TL)'),
    dateField('kesintiTarihi', 'Kesinti tarihi'),
    areaField('neden', 'İtiraz nedeniniz', { hint: 'Neden haksız olduğunu düşünüyorsunuz?' }),
  ],
  muhatap: (c) => [upperName(c, 'banka'), 'Müşteri İlişkileri / Şikâyet Yönetimi'],
  konu: (c) => `${c.v('ucretAdi')} kesintisine itiraz ve iade talebi`,
  body: (c) => {
    const tutar = c.num('tutar')
    return [
      `${c.date('kesintiTarihi')} tarihinde bankanız nezdindeki ${c.has('urunNo') ? `(son 4 hane: ${c.raw('urunNo')}) ` : ''}hesabımdan/kartımdan "${c.v('ucretAdi')}" adı altında ${tutar !== null ? `${tutar.toLocaleString('tr-TR')} TL` : c.v('tutar')} tahsil edilmiştir.`,
      'Bu kesintiye şu nedenle itiraz ediyorum:',
      ...c.paragraphs('neden'),
      'Söz konusu kesintinin dayanağının (sözleşme maddesi ve hesaplama yöntemi) yazılı olarak açıklanmasını, hukuki dayanağı yoksa tahsil edilen tutarın hesabıma iade edilmesini talep ederim.',
      'Başvurumun sonucunun yazılı olarak tarafıma bildirilmesini rica ederim. Talebimin karşılanmaması hâlinde tüketici hakem heyetine veya tüketici mahkemesine başvuracağımı bilgilerinize sunarım.',
    ]
  },
  ekler: () => ['Hesap ekstresi veya kart ekstresi', 'Varsa bankayla önceki yazışmalar'],
  where: { merciId: 'banka' },
  faq: [
    {
      q: 'Banka ücretlerine nasıl itiraz edilir?',
      a: 'Önce bankanın şikâyet kanalına yazılı başvurun ve kayıt numarasını alın. Cevap yetersizse veya gelmezse tüketici hakem heyetine başvurabilirsiniz.',
    },
    {
      q: 'Bankanın cevap süresi nedir?',
      a: 'Bankaların cevap süresine ilişkin düzenleme bu sitede resmî kaynaktan doğrulanamadığı için kesin bir süre verilmemiştir. Bankanızın internet sitesindeki başvuru koşullarına bakın.',
    },
  ],
  related: ['tuketici-hakem-heyeti-basvurusu', 'abonelik-iptali', 'cimer-basvurusu'],
}

export default bankaUcretItirazi
