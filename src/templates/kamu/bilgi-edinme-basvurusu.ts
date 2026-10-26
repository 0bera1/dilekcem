import type { TemplateDef } from '../engine'
import { areaField, selectField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const bilgiEdinme: TemplateDef = {
  slug: 'bilgi-edinme-basvurusu',
  title: 'Bilgi edinme hakkı başvuru dilekçesi',
  category: 'kamu',
  description:
    'Bir kamu kurumundan bilgi veya belge istemek için 4982 sayılı Bilgi Edinme Hakkı Kanunu kapsamında hazır başvuru dilekçesi.',
  fields: [
    textField('kurum', 'Kurum adı', {
      step: 2,
      placeholder: 'Örnek: Örnek Belediyesi Fen İşleri Müdürlüğü',
    }),
    areaField('istenen', 'İstediğiniz bilgi veya belge', {
      hint: 'Mümkün olduğunca açık ve tek tek yazın.',
    }),
    areaField('amac', 'Gerekçe (isteğe bağlı)', {
      required: false,
      maxLength: 600,
      hint: 'Kanun gerekçe göstermeyi şart koşmaz.',
    }),
    selectField('ulasim', 'Cevabın size ulaştırılma şekli', [
      { value: 'eposta', label: 'e-posta ile' },
      { value: 'posta', label: 'posta yoluyla adresime' },
      { value: 'elden', label: 'elden teslim ile' },
    ]),
  ],
  muhatap: (c) => [upperTr(c.v('kurum')), 'Bilgi Edinme Birimi'],
  konu: () => 'Bilgi edinme başvurusu',
  body: (c) => {
    const out = [
      `${c.law('bilgi-edinme-4')} kapsamında aşağıdaki bilgi/belgelere erişmek istiyorum:`,
      ...c.paragraphs('istenen'),
    ]
    if (c.has('amac')) out.push('Gerekçe:', ...c.paragraphs('amac'))
    out.push(
      `İstenen bilgi veya belgenin ${c.option('ulasim')} tarafıma ulaştırılmasını talep ederim.`,
      `${c.law('bilgi-edinme-11')} uyarınca başvurumun ${c.sure('cevap')} içinde sonuçlandırılmasını, başvurunun reddi hâlinde gerekçeli yazılı cevap verilmesini ve itiraz yolunun bildirilmesini arz ederim.`,
    )
    return out
  },
  ekler: () => [],
  where: { merciId: 'bilgi-edinme-kurumu' },
  reminders: [{ fromField: 'tarih', sureId: 'cevap', title: 'Bilgi edinme cevap süresi doluyor' }],
  faq: [
    {
      q: 'Bilgi edinme başvurusuna kaç günde cevap verilir?',
      a: 'Kurumlar, bilgi veya belgeye erişimi {{sure:cevap}} içinde sağlar. Başka birim veya kurumdan görüş alınması gerekiyorsa süre uzayabilir (en çok {{sure:cevap-uzatma}}) ve bu durum yazılı olarak bildirilir.',
    },
    {
      q: 'Başvurum reddedilirse ne yapabilirim?',
      a: "Ret kararının tebliğinden itibaren {{sure:itiraz}} içinde Bilgi Edinme Değerlendirme Kurulu'na itiraz edebilir, ardından yargı yoluna başvurabilirsiniz.",
    },
  ],
  related: ['cimer-basvurusu', 'belediye-sikayeti', 'belge-talebi'],
}

export default bilgiEdinme
