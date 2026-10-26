import type { TemplateDef } from '../engine'
import { dateField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const istifa: TemplateDef = {
  slug: 'istifa-dilekcesi',
  title: 'İstifa dilekçesi',
  category: 'is-okul',
  description:
    'İş sözleşmenizi kendi isteğinizle sonlandırmak için sade ve resmî dille hazırlanmış istifa dilekçesi. Bildirim süresine uygun tarihi belirleyin.',
  fields: [
    textField('isveren', 'İşveren veya işyeri adı', { step: 2 }),
    textField('gorev', 'Göreviniz'),
    dateField('baslama', 'İşe başlama tarihiniz', { required: false }),
    dateField('sonGun', 'Son çalışma gününüz', {
      hint: 'Kıdeminize göre yasal bildirim süresini hesaba katın.',
    }),
  ],
  muhatap: (c) => [upperTr(c.v('isveren')), 'İnsan Kaynakları / İşveren Vekilliği'],
  konu: () => 'İstifa bildirimi',
  body: (c) => [
    `Firmanızda ${c.v('gorev')} olarak${c.has('baslama') ? ` ${c.date('baslama')} tarihinden bu yana` : ''} görev yapmaktayım.`,
    `Kendi isteğimle iş sözleşmemi sona erdirmek istiyorum. Son çalışma günüm ${c.date('sonGun')} olacaktır.`,
    `${c.law('is-kanunu-17')} uyarınca belirsiz süreli iş sözleşmelerinde bildirim süresine uyulması gerekir; bu süreye uygun davranacağım ve devam eden işlerimi düzenli biçimde devredeceğim.`,
    'İş sözleşmem sona ererken ödenmemiş ücret, kullanılmamış yıllık izin ücreti ve diğer yasal haklarımın hesaplanarak ödenmesini, çalışma belgemin verilmesini talep ederim.',
    'Bugüne kadar sağlanan imkânlar için teşekkür ederim.',
  ],
  ekler: () => [],
  where: { merciId: 'isveren' },
  faq: [
    {
      q: 'İstifa ederken bildirim süresi var mı?',
      a: 'Belirsiz süreli iş sözleşmelerinde kıdeme göre bildirim süresi vardır: {{sure:bildirim-2hafta}}, {{sure:bildirim-4hafta}}, {{sure:bildirim-6hafta}} veya {{sure:bildirim-8hafta}}. Bu süreler asgaridir ve sözleşmeyle artırılabilir.',
    },
    {
      q: 'İstifa dilekçesini kime ve nasıl vermeliyim?',
      a: 'İşverene yazılı olarak, imza karşılığı elden veya noter/KEP ile verin. Kopyanızı saklayın. Tazminat hakları kıdem ve fesih nedenine göre değiştiği için durumunuz için avukata ya da işçi hakları danışmanlığına başvurun.',
    },
  ],
  related: ['izin-talebi', 'belge-talebi', 'mazeret-dilekcesi'],
}

export default istifa
