import type { TemplateDef } from '../engine'
import { areaField, dateField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const trafikCezasi: TemplateDef = {
  slug: 'trafik-cezasi-itirazi',
  title: 'Trafik cezası itiraz dilekçesi',
  category: 'kamu',
  description:
    'Trafik idari para cezasına itiraz için mahkemeye verilecek örnek dilekçe. Tebliğ tarihinden itibaren başlayan itiraz süresini kaçırmayın.',
  fields: [
    textField('mahkeme', 'Mahkeme veya hâkimlik adı', {
      step: 2,
      placeholder: 'Örnek: Ankara Sulh Ceza Hâkimliği',
      hint: 'Cezayı veren birimin bulunduğu yerdeki sulh ceza merciini yazın; emin değilseniz adliyeden teyit edin.',
    }),
    textField('tutanakNo', 'Ceza tutanak veya karar numarası'),
    textField('plaka', 'Araç plakası'),
    dateField('cezaTarihi', 'Cezanın kesildiği tarih'),
    dateField('tebligTarihi', 'Tebliğ (haberdar olduğunuz) tarih'),
    textField('kurum', 'Cezayı veren birim', {
      placeholder: 'Örnek: Emniyet Müdürlüğü Trafik Denetleme Şube',
    }),
    areaField('gerekce', 'İtiraz gerekçeniz', {
      hint: 'Hatalı tespit, yanlış plaka, işaret eksikliği gibi somut nedenleri yazın.',
    }),
  ],
  muhatap: (c) => [upperTr(c.v('mahkeme'))],
  konu: (c) => `${c.v('tutanakNo')} sayılı idari para cezasına itiraz`,
  body: (c) => [
    `İtiraz eden: ${c.v('adSoyad')}\nİtiraza konu karar: ${c.v('kurum')} tarafından ${c.date('cezaTarihi')} tarihinde düzenlenen ${c.v('tutanakNo')} numaralı trafik idari para cezası (Araç plakası: ${c.v('plaka')}).`,
    `Karar tarafıma ${c.date('tebligTarihi')} tarihinde tebliğ edilmiştir. ${c.law('kabahatler-27')} uyarınca tebliğden itibaren ${c.sure('itiraz')} içinde yapılan bu başvuru süresindedir.`,
    'İtiraz gerekçelerim şunlardır:',
    ...c.paragraphs('gerekce'),
    'Yukarıda açıklanan nedenlerle idari para cezasının iptaline, bu mümkün olmazsa cezanın hukuka uygun hâle getirilmesine karar verilmesini saygılarımla arz ve talep ederim.',
  ],
  ekler: () => [
    'Ceza tutanağı veya karar örneği',
    'Tebliğ tarihini gösteren belge',
    'Deliller (fotoğraf, kayıt vb.)',
    'Kimlik fotokopisi',
  ],
  where: { merciId: 'sulh-ceza' },
  reminders: [
    { fromField: 'tebligTarihi', sureId: 'itiraz', title: 'Trafik cezası itiraz süresi bitiyor' },
  ],
  faq: [
    {
      q: 'Trafik cezasına itiraz süresi nedir?',
      a: 'Kararın tebliğ veya tefhimi tarihinden itibaren en geç {{sure:itiraz}}. Bu süre içinde başvurulmazsa karar kesinleşir. Mücbir sebep varsa kanun ek bir kısa süre tanır.',
    },
    {
      q: 'İtiraz dilekçesini kim verebilir?',
      a: 'Dilekçe, kanuni temsilci veya avukat tarafından sulh ceza mercilerine verilir ve iki nüsha hazırlanır. Ayrıntılar için kanun metnine ve adliyeye danışın.',
    },
    {
      q: 'İtiraz cezanın ödenmesini durdurur mu?',
      a: 'Hayır, kural olarak durdurmaz; yalnızca mahkeme yerine getirmeyi durdurabilir. İndirimli ödeme hakkınız için ceza tutanağındaki koşulları ayrıca kontrol edin.',
    },
  ],
  related: ['cimer-basvurusu', 'bilgi-edinme-basvurusu', 'belediye-sikayeti'],
}

export default trafikCezasi
