import type { TemplateDef } from '../engine'
import { selectField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const belgeTalebi: TemplateDef = {
  slug: 'belge-talebi',
  title: 'Belge talebi dilekçesi',
  category: 'is-okul',
  description:
    'Çalışma belgesi, öğrenci belgesi, transkript veya benzeri bir belgeyi kurumdan talep etmek için hazır dilekçe.',
  fields: [
    textField('kurum', 'Belgeyi verecek kurum veya işyeri', { step: 2 }),
    textField('belge', 'İstenen belge', { placeholder: 'Örnek: Çalışma belgesi' }),
    textField('amac', 'Belgenin kullanılacağı yer', {
      required: false,
      placeholder: 'Örnek: Vize başvurusu',
    }),
    selectField('teslim', 'Belgenin tarafınıza ulaştırılması', [
      { value: 'elden', label: 'elden teslim' },
      { value: 'posta', label: 'posta yoluyla adresime gönderilmesi' },
      { value: 'eposta', label: 'elektronik posta ile gönderilmesi' },
    ]),
  ],
  muhatap: (c) => [upperTr(c.v('kurum'))],
  konu: (c) => `${c.v('belge')} talebi`,
  body: (c) => [
    `Kurumunuz nezdindeki kaydıma dayanarak aşağıdaki belgenin düzenlenmesini talep ediyorum.\nİstenen belge: ${c.v('belge')}${c.has('amac') ? `\nKullanım amacı: ${c.v('amac')}` : ''}`,
    `Belgenin ${c.option('teslim')} suretiyle tarafıma ulaştırılmasını rica ederim.`,
    'Talebimin değerlendirilerek gereğinin yapılmasını arz ederim.',
  ],
  ekler: () => ['Kimlik fotokopisi'],
  where: { merciId: 'belge-veren-kurum' },
  faq: [
    {
      q: 'Kurum belgeyi vermezse ne yapabilirim?',
      a: 'Kamu kurumlarından bilgi veya belge isteyebilir, bunun için bilgi edinme başvurusu yapabilirsiniz. Özel kurumlarda yazılı ret veya cevapsızlık durumunda hukuki yollar için avukata danışın.',
    },
    {
      q: 'Belge talebi ne kadar sürede sonuçlanır?',
      a: 'Kamu kurumları için bilgi edinme sürelerine bakın. Özel kurum ve işyerleri için bu siteye girilmiş doğrulanmış bir süre yoktur; kurumun iç prosedürüne göre değişir.',
    },
  ],
  related: ['bilgi-edinme-basvurusu', 'izin-talebi', 'istifa-dilekcesi'],
}

export default belgeTalebi
