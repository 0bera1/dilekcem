import type { TemplateDef } from '../engine'
import { areaField, dateField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const cimerBasvurusu: TemplateDef = {
  slug: 'cimer-basvurusu',
  title: 'CİMER başvuru metni',
  category: 'kamu',
  description:
    'Bir kamu kurumuna ilişkin şikâyet, talep veya önerinizi CİMER üzerinden iletmek için hazır başvuru metni. Konuyu net ve belgeli anlatın.',
  fields: [
    textField('kurum', 'Başvurunun ilgili olduğu kurum', {
      step: 2,
      placeholder: 'Örnek: Örnek İlçe Belediyesi',
    }),
    textField('baslik', 'Başvuru başlığı', { placeholder: 'Örnek: Kaldırım onarım talebi' }),
    dateField('olayTarihi', 'Olayın tarihi', { required: false }),
    areaField('aciklama', 'Konunun açıklaması', {
      hint: 'Olguları sırayla, tarih ve yer belirterek yazın.',
    }),
    areaField('talep', 'Talebiniz', { maxLength: 800 }),
  ],
  muhatap: (c) => [
    'CUMHURBAŞKANLIĞI İLETİŞİM MERKEZİ (CİMER)',
    `İlgili kurum: ${upperTr(c.v('kurum'))}`,
  ],
  konu: (c) => c.v('baslik'),
  body: (c) => [
    `${c.has('olayTarihi') ? `${c.date('olayTarihi')} tarihinde yaşanan ` : ''}konuyla ilgili başvuruda bulunuyorum.`,
    ...c.paragraphs('aciklama'),
    'Talebim:',
    ...c.paragraphs('talep'),
    `Başvurumun ilgili kuruma iletilerek incelenmesini ve ${c.law('dilekce-hakki-7')} gereğince sonucun tarafıma bildirilmesini arz ederim.`,
  ],
  ekler: () => ['Konuyla ilgili belge, fotoğraf veya yazışmalar (varsa)'],
  where: { merciId: 'cimer' },
  reminders: [{ fromField: 'tarih', sureId: 'cevap', title: 'CİMER cevap süresi doluyor' }],
  faq: [
    {
      q: 'CİMER başvurusuna ne kadar sürede cevap verilir?',
      a: 'Dilek ve şikâyet başvurularına en geç {{sure:cevap}} içinde gerekçeli cevap verilir. Süre başvurunun kuruma ulaşmasından değil, kanuna göre işler; takip için başvuru numaranızı saklayın.',
    },
    {
      q: 'Başvuru metnini nereye yapıştırırım?',
      a: 'cimer.gov.tr adresinde başvuru formunu açın; konu ve açıklama alanlarına bu metni kopyalayın. Kimlik bilgisi yazımı sitenin kendi formunda alınır.',
    },
  ],
  related: ['bilgi-edinme-basvurusu', 'belediye-sikayeti', 'trafik-cezasi-itirazi'],
}

export default cimerBasvurusu
