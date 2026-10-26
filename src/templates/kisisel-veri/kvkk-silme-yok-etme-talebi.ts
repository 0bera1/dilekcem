import type { TemplateDef } from '../engine'
import { areaField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const kvkkSilme: TemplateDef = {
  slug: 'kvkk-silme-yok-etme-talebi',
  title: 'KVKK silme ve yok etme talebi',
  category: 'kisisel-veri',
  description:
    'Bir kurumun veya firmanın elindeki kişisel verilerinizin silinmesini, yok edilmesini ya da anonim hâle getirilmesini isteyen hazır KVKK dilekçesi.',
  fields: [
    textField('kurum', 'Veri sorumlusu (kurum veya firma)', { step: 2 }),
    textField('kimlikBilgisi', 'Sizi tanımlayan bilgi', {
      required: false,
      hint: 'Müşteri numarası, kayıtlı telefon veya e-posta gibi. T.C. kimlik numarası yazmak zorunda değilsiniz.',
    }),
    areaField('kapsam', 'Silinmesini istediğiniz veriler', {
      hint: 'Örnek: Üyelik kaydım, adres bilgilerim, çağrı kayıtları.',
    }),
    areaField('gerekce', 'Gerekçe', {
      maxLength: 800,
      hint: 'Örnek: Üyeliğimi sonlandırdım; verilerin işlenmesini gerektiren amaç kalmadı.',
    }),
  ],
  muhatap: (c) => [upperTr(c.v('kurum')), 'Veri Sorumlusu / Kişisel Verileri Koruma Birimi'],
  konu: () => 'Kişisel verilerin silinmesi, yok edilmesi veya anonim hâle getirilmesi talebi',
  body: (c) => [
    `${c.law('kvkk-11')} ve ${c.law('kvkk-7')} uyarınca ilgili kişi sıfatıyla başvuruyorum.${c.has('kimlikBilgisi') ? `\nSizinle ilişkilendirilebilecek bilgi: ${c.v('kimlikBilgisi')}` : ''}`,
    'Silinmesini/yok edilmesini istediğim kişisel veriler:',
    ...c.paragraphs('kapsam'),
    'Talebimin gerekçesi:',
    ...c.paragraphs('gerekce'),
    'Verilerimin kanunda öngörülen şekilde silinmesini, yok edilmesini veya anonim hâle getirilmesini; bu verilerin aktarıldığı üçüncü kişilere de durumun bildirilmesini talep ederim. Saklanmasını gerektiren bir kanuni yükümlülük varsa hangi verilerin hangi dayanakla saklanacağının gerekçesiyle bildirilmesini rica ederim.',
    `${c.law('kvkk-13')} uyarınca başvurumun en geç ${c.sure('cevap')} içinde ücretsiz olarak sonuçlandırılmasını arz ederim.`,
  ],
  ekler: () => [],
  where: { merciId: 'veri-sorumlusu' },
  reminders: [
    { fromField: 'tarih', sureId: 'cevap', title: 'KVKK silme talebi cevap süresi doluyor' },
  ],
  faq: [
    {
      q: 'Her veri silinir mi?',
      a: 'Hayır. Kanunen saklanması gereken kayıtlar (örneğin muhasebe veya sözleşme belgeleri) silinmeyebilir; veri sorumlusu bunu gerekçesiyle bildirmelidir.',
    },
    {
      q: 'Talebim reddedilirse ne yapabilirim?',
      a: "Ret veya yetersiz cevap hâlinde Kişisel Verileri Koruma Kurulu'na şikâyet edebilirsiniz. Süre: cevabı öğrenmeden itibaren {{sure:kvkk-kurulu/sikayet}}, başvuru tarihinden itibaren her hâlde {{sure:kvkk-kurulu/sikayet-azami}}.",
    },
  ],
  related: ['kvkk-bilgi-talebi', 'ticari-ileti-onay-geri-cekme', 'cimer-basvurusu'],
}

export default kvkkSilme
