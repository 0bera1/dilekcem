import type { TemplateDef } from '../engine'
import { areaField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const kvkkBilgiTalebi: TemplateDef = {
  slug: 'kvkk-bilgi-talebi',
  title: 'KVKK bilgi talebi (kişisel verilerim işleniyor mu?)',
  category: 'kisisel-veri',
  description:
    'Bir kurumun veya firmanın sizin hakkınızda hangi kişisel verileri işlediğini öğrenmek için KVKK kapsamında hazır başvuru dilekçesi.',
  fields: [
    textField('kurum', 'Veri sorumlusu (kurum veya firma)', { step: 2 }),
    textField('kimlikBilgisi', 'Sizi tanımlayan bilgi', {
      required: false,
      hint: 'Müşteri numarası, kayıtlı telefon veya e-posta gibi. T.C. kimlik numarası yazmak zorunda değilsiniz.',
    }),
    areaField('ekTalep', 'Eklemek istediğiniz özel talep', { required: false, maxLength: 800 }),
  ],
  muhatap: (c) => [upperTr(c.v('kurum')), 'Veri Sorumlusu / Kişisel Verileri Koruma Birimi'],
  konu: () => 'Kişisel verilerle ilgili bilgi talebi',
  body: (c) => {
    const out = [
      `${c.law('kvkk-11')} uyarınca ilgili kişi sıfatıyla başvuruyorum.${c.has('kimlikBilgisi') ? `\nSizinle ilişkilendirilebilecek bilgi: ${c.v('kimlikBilgisi')}` : ''}`,
      'Aşağıdaki hususlarda yazılı bilgi verilmesini talep ederim:',
      'a) Hakkımda kişisel veri işlenip işlenmediği,\nb) İşleniyorsa hangi kişisel verilerimin işlendiği ve işlenme amacı, amacına uygun kullanılıp kullanılmadığı,\nc) Verilerimin yurt içinde veya yurt dışında aktarıldığı üçüncü kişiler,\nç) Eksik veya yanlış işlenen veri varsa bunların düzeltilmesi.',
    ]
    if (c.has('ekTalep')) out.push('Ek talebim:', ...c.paragraphs('ekTalep'))
    out.push(
      `${c.law('kvkk-13')} uyarınca başvurumun en geç ${c.sure('cevap')} içinde ücretsiz olarak sonuçlandırılmasını, cevabın yazılı veya elektronik ortamda bildirilmesini arz ederim.`,
    )
    return out
  },
  ekler: () => [],
  where: { merciId: 'veri-sorumlusu' },
  reminders: [{ fromField: 'tarih', sureId: 'cevap', title: 'KVKK cevap süresi doluyor' }],
  faq: [
    {
      q: 'KVKK başvurusu nereye yapılır?',
      a: 'Önce veri sorumlusuna, firmanın aydınlatma metninde belirttiği başvuru yoluyla (yazılı dilekçe, KEP veya kayıtlı e-posta) yapılır.',
    },
    {
      q: 'Cevap süresi nedir, cevap gelmezse ne olur?',
      a: "Veri sorumlusu en geç {{sure:cevap}} içinde cevap verir. Ret, yetersiz cevap veya cevapsızlık hâlinde Kişisel Verileri Koruma Kurulu'na şikâyet edilebilir (cevabı öğrenmeden itibaren {{sure:kvkk-kurulu/sikayet}}, başvurudan itibaren her hâlde {{sure:kvkk-kurulu/sikayet-azami}}).",
    },
  ],
  related: ['kvkk-silme-yok-etme-talebi', 'ticari-ileti-onay-geri-cekme', 'bilgi-edinme-basvurusu'],
}

export default kvkkBilgiTalebi
