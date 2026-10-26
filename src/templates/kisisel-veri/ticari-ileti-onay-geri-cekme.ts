import type { TemplateDef } from '../engine'
import { dateField, selectField, textField } from '../helpers'
import { upperTr } from '../../lib/tr'

const ticariIleti: TemplateDef = {
  slug: 'ticari-ileti-onay-geri-cekme',
  title: 'Ticari ileti (SMS, e-posta, arama) onayını geri çekme',
  category: 'kisisel-veri',
  description:
    'İstenmeyen reklam SMS, e-posta veya aramalarını durdurmak için ticari elektronik ileti onayınızı geri çeken hazır dilekçe.',
  fields: [
    textField('firma', 'Mesaj gönderen firma', { step: 2 }),
    selectField('arac', 'İletinin türü', [
      { value: 'sms', label: 'Kısa mesaj (SMS)' },
      { value: 'eposta', label: 'E-posta' },
      { value: 'arama', label: 'Telefon araması' },
    ]),
    textField('adresim', 'İletilerin ulaştığı telefon veya e-posta', {
      placeholder: 'Örnek: 0532 123 45 67',
    }),
    dateField('sonIleti', 'Aldığınız son iletinin tarihi', { required: false }),
  ],
  muhatap: (c) => [upperTr(c.v('firma')), 'Müşteri İlişkileri'],
  konu: () => 'Ticari elektronik ileti onayının geri çekilmesi',
  body: (c) => [
    `Firmanızdan ${c.option('arac').toLocaleLowerCase('tr-TR')} yoluyla ticari elektronik ileti almaktayım.\nİletilerin ulaştığı adres/numara: ${c.v('adresim')}${c.has('sonIleti') ? `\nSon aldığım iletinin tarihi: ${c.date('sonIleti')}` : ''}`,
    `${c.law('eticaret-6')} uyarınca ticari elektronik iletiler önceden onay alınarak gönderilebilir. Daha önce verdiğim onay varsa bu yazı ile geri çektiğimi, bundan sonra adıma ve yukarıdaki adres/numaraya ticari elektronik ileti gönderilmemesini talep ederim.`,
    `${c.law('eticaret-8')} uyarınca talebimin ulaşmasından itibaren ${c.sure('durdurma')} içinde ileti gönderiminin durdurulmasını ve İleti Yönetim Sistemi'ndeki kaydımın buna göre güncellenmesini rica ederim.`,
    'Talebimin yerine getirildiğinin yazılı olarak bildirilmesini arz ederim.',
  ],
  ekler: () => ['Alınan iletinin ekran görüntüsü (varsa)'],
  where: { merciId: 'ticari-ileti-gonderici' },
  reminders: [
    {
      fromField: 'tarih',
      sureId: 'durdurma',
      title: 'İleti gönderimi durmuş olmalı, kontrol edin',
    },
  ],
  faq: [
    {
      q: 'Reklam mesajlarını nasıl durdururum?',
      a: 'İletideki ret bağlantısını veya numarasını kullanabilir, İleti Yönetim Sistemi (iys.org.tr) üzerinden tercihlerinizi güncelleyebilir ya da bu dilekçeyle firmaya yazılı bildirebilirsiniz.',
    },
    {
      q: 'Firma ne kadar sürede göndermeyi durdurmalıdır?',
      a: 'Talep ulaştıktan sonra hizmet sağlayıcı {{sure:durdurma}} içinde ileti göndermeyi durdurur.',
    },
  ],
  related: ['kvkk-silme-yok-etme-talebi', 'kvkk-bilgi-talebi', 'abonelik-iptali'],
}

export default ticariIleti
