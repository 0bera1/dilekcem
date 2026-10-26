import type { TemplateDef } from '../engine'
import { areaField, dateField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const mazeret: TemplateDef = {
  slug: 'mazeret-dilekcesi',
  title: 'Mazeret dilekçesi (okul ve üniversite)',
  category: 'is-okul',
  description:
    'Devamsızlık, sınava girememe veya ödev teslim gecikmesi için okul ya da üniversite idaresine verilecek hazır mazeret dilekçesi.',
  fields: [
    textField('okul', 'Okul veya fakülte adı', { step: 2 }),
    textField('ogrenciNo', 'Öğrenci numarası', { required: false }),
    textField('sinif', 'Sınıf veya bölüm', { required: false }),
    dateField('baslangic', 'Mazeretin başlangıç tarihi'),
    dateField('bitis', 'Mazeretin bitiş tarihi', {
      required: false,
      hint: 'Tek gün ise boş bırakın.',
    }),
    areaField('neden', 'Mazeretinizin açıklaması', { maxLength: 800 }),
    textField('belge', 'Ekteki belge', { required: false, placeholder: 'Örnek: Doktor raporu' }),
  ],
  muhatap: (c) => [upperTr(c.v('okul')), 'Müdürlüğüne / Dekanlığına'],
  konu: () => 'Mazeretin kabulü talebi',
  body: (c) => [
    `${c.has('sinif') ? `${c.v('sinif')} ` : ''}${c.has('ogrenciNo') ? `(Öğrenci no: ${c.v('ogrenciNo')}) ` : ''}öğrencisiyim.`
      .trim()
      .replace(/^öğrencisiyim\.$/, 'Öğrencinizim.'),
    c.has('bitis')
      ? `${c.date('baslangic')} ile ${c.date('bitis')} tarihleri arasında aşağıda açıklanan mazeretim nedeniyle derslere/sınavlara katılamadım.`
      : `${c.date('baslangic')} tarihinde aşağıda açıklanan mazeretim nedeniyle derslere/sınavlara katılamadım.`,
    ...c.paragraphs('neden'),
    `Mazeretimin kabul edilerek devamsızlığımın bu doğrultuda değerlendirilmesini ve varsa mazeret sınavı veya ödev teslimi için hak tanınmasını saygılarımla arz ederim.`,
  ],
  ekler: (c) => (c.has('belge') ? [c.v('belge')] : []),
  where: { merciId: 'okul-idaresi' },
  faq: [
    {
      q: 'Mazeret dilekçesi için süre sınırı var mı?',
      a: 'Mazeret bildirim süreleri ve devamsızlık sınırları okul türüne ve kurum yönetmeliğine göre değişir. Bu sitede kesin bir süre verilmemiştir; kurumunuzun yönetmeliğine veya öğrenci işlerine danışın.',
    },
    {
      q: 'Hangi belgeler mazereti destekler?',
      a: 'Sağlık raporu, resmî kurum yazısı veya olayı gösteren başka bir belge işe yarar. Belgenin tarihleri mazeret tarihleriyle uyumlu olmalıdır.',
    },
  ],
  related: ['izin-talebi', 'belge-talebi', 'istifa-dilekcesi'],
}

export default mazeret
