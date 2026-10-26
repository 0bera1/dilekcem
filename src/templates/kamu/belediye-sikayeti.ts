import type { TemplateDef } from '../engine'
import { areaField, dateField, selectField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const belediyeSikayeti: TemplateDef = {
  slug: 'belediye-sikayeti',
  title: 'Belediye şikâyet dilekçesi',
  category: 'kamu',
  description:
    'Çöp, yol, gürültü, ruhsat veya altyapı sorunu için belediyeye yazılı şikâyet ve talep dilekçesi. Konum ve tarihle birlikte hazırlayın.',
  fields: [
    textField('belediye', 'Belediye adı', {
      step: 2,
      placeholder: 'Örnek: Örnek İlçe Belediye Başkanlığı',
    }),
    selectField('tur', 'Sorunun türü', [
      { value: 'temizlik', label: 'Temizlik ve çöp toplama' },
      { value: 'yol', label: 'Yol, kaldırım ve altyapı' },
      { value: 'gurultu', label: 'Gürültü ve çevre' },
      { value: 'ruhsat', label: 'Ruhsat ve denetim' },
      { value: 'diger', label: 'Diğer' },
    ]),
    textField('konum', 'Sorunun yaşandığı konum', { placeholder: 'Mahalle, cadde, kapı numarası' }),
    dateField('olayTarihi', 'Sorunun fark edildiği tarih', { required: false }),
    areaField('aciklama', 'Sorunun açıklaması'),
    areaField('talep', 'Talebiniz', { maxLength: 600 }),
  ],
  muhatap: (c) => [upperTr(c.v('belediye'))],
  konu: (c) => `${c.option('tur')} konusunda şikâyet ve talep`,
  body: (c) => [
    `${c.v('konum')} adresinde ${c.has('olayTarihi') ? `${c.date('olayTarihi')} tarihinden bu yana ` : ''}aşağıdaki sorun devam etmektedir.`,
    ...c.paragraphs('aciklama'),
    'Talebim:',
    ...c.paragraphs('talep'),
    `Konunun incelenmesini, gerekli işlemin yapılmasını ve ${c.law('dilekce-hakki-7')} gereğince sonucun tarafıma yazılı olarak bildirilmesini saygılarımla arz ederim.`,
  ],
  ekler: () => ['Sorunu gösteren fotoğraf veya videolar (varsa)'],
  where: { merciId: 'belediye' },
  reminders: [{ fromField: 'tarih', sureId: 'cevap', title: 'Belediye cevap süresi doluyor' }],
  faq: [
    {
      q: 'Belediyeye yazılı şikâyete ne kadar sürede cevap verilir?',
      a: 'Dilek ve şikâyet başvurularına en geç {{sure:cevap}} içinde gerekçeli cevap verilir. Başvuru numaranızı ve teslim belgenizi saklayın.',
    },
    {
      q: 'Cevap gelmezse ne yapmalıyım?',
      a: 'Aynı konuyu CİMER üzerinden de iletebilir, belediye meclisi üyelerine veya ilgili müdürlüğe tekrar yazılı başvurabilirsiniz.',
    },
  ],
  related: ['cimer-basvurusu', 'bilgi-edinme-basvurusu', 'trafik-cezasi-itirazi'],
}

export default belediyeSikayeti
