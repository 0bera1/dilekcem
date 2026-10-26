import type { TemplateDef } from '../engine'
import { areaField, dateField, selectField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const izinTalebi: TemplateDef = {
  slug: 'izin-talebi',
  title: 'İzin talebi dilekçesi',
  category: 'is-okul',
  description:
    'Yıllık ücretli izin, ücretsiz izin veya mazeret izni için işverene verilecek hazır izin talebi dilekçesi. Tarihleri seçin, indirin.',
  fields: [
    textField('isveren', 'İşveren veya birim', {
      step: 2,
      placeholder: 'Örnek: Örnek A.Ş. İnsan Kaynakları Müdürlüğü',
    }),
    textField('gorev', 'Göreviniz', { required: false }),
    selectField('tur', 'İzin türü', [
      { value: 'yillik', label: 'yıllık ücretli izin' },
      { value: 'ucretsiz', label: 'ücretsiz izin' },
      { value: 'mazeret', label: 'mazeret izni' },
    ]),
    dateField('baslangic', 'İzin başlangıç tarihi'),
    dateField('bitis', 'İzin bitiş tarihi'),
    dateField('donus', 'İşe dönüş tarihi', { required: false }),
    areaField('gerekce', 'Açıklama (isteğe bağlı)', { required: false, maxLength: 500 }),
  ],
  muhatap: (c) => [upperTr(c.v('isveren'))],
  konu: (c) => `${c.option('tur')} talebi`.replace(/^./, (x) => x.toLocaleUpperCase('tr-TR')),
  body: (c) => {
    const out = [
      `${c.has('gorev') ? `${c.v('gorev')} olarak görev yapmaktayım. ` : ''}${c.date('baslangic')} ile ${c.date('bitis')} tarihleri arasında ${c.option('tur')} kullanmak istiyorum.${c.has('donus') ? ` İzin bitiminde ${c.date('donus')} tarihinde göreve başlayacağım.` : ''}`,
    ]
    if (c.raw('tur') === 'yillik') {
      out.push(
        `Talebim, ${c.law('is-kanunu-53')} kapsamındaki yıllık ücretli izin hakkıma dayanmaktadır.`,
      )
    }
    if (c.has('gerekce')) out.push(...c.paragraphs('gerekce'))
    out.push(
      'İzin talebimin uygun görülerek onaylanmasını, devam eden işlerimin izin süresince aksamaması için gerekli devir-teslimi yapacağımı bildirir, gereğini arz ederim.',
    )
    return out
  },
  ekler: () => [],
  where: { merciId: 'isveren' },
  faq: [
    {
      q: 'Yıllık izin hakkı ne zaman doğar?',
      a: 'İşyerinde işe başladığı günden itibaren, deneme süresi dahil, en az bir yıl çalışmış işçilere yıllık ücretli izin verilir. İzin süresi hizmet yılına göre değişir ve kanundaki asgari sürelerden az olamaz.',
    },
    {
      q: 'İşveren izni vermek zorunda mı?',
      a: 'Yıllık ücretli izin işçinin kanundan doğan hakkıdır; ancak kullanılacağı tarih işyerinin iş düzenine göre işverenle birlikte belirlenir. Ücretsiz ve mazeret izinleri iş sözleşmesine ve işyeri uygulamasına bağlıdır.',
    },
  ],
  related: ['istifa-dilekcesi', 'mazeret-dilekcesi', 'belge-talebi'],
}

export default izinTalebi
