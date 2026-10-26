import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { VerifiedBadge } from '../components/WhereBox'
import mevzuatJson from '../data/mevzuat.json'
import { mevzuatListSchema } from '../data/schema'
import { formatLongDate } from '../lib/dates'
import { merciler } from '../templates/engine'
import s from './Pages.module.css'

export function Privacy() {
  return (
    <div className={`${s.page} ${s.prose}`}>
      <Seo
        title="Gizlilik"
        description="Dilekçem'de yazdığınız hiçbir bilgi sunucuya gönderilmez. Çerez, izleyici ve üçüncü taraf analitik kullanılmaz."
        path="/gizlilik"
      />
      <h1 className={s.h1}>Gizlilik</h1>
      <p className={s.lead}>Kısaca: yazdığınız hiçbir şey cihazınızdan çıkmaz.</p>

      <h2 className={s.h2}>Verileriniz nerede işlenir?</h2>
      <p>
        Dilekçem'in arka ucu (sunucu tarafı uygulaması, veri tabanı) yoktur. Adınız, adresiniz, T.C.
        kimlik numaranız, telefonunuz ve olay anlatımınız yalnızca tarayıcınızda işlenir. Önizleme,
        PDF, Word ve metin çıktıları da tarayıcınızda üretilir.
      </p>

      <h2 className={s.h2}>Neleri kullanmıyoruz?</h2>
      <ul>
        <li>Çerez kullanmıyoruz.</li>
        <li>Analitik, reklam veya izleme betiği kullanmıyoruz.</li>
        <li>
          Dış yazı tipi, CDN veya başka bir alan adından kaynak yüklemiyoruz; yazı tipleri sitenin
          kendisinden sunulur.
        </li>
        <li>Kullanıcı girdisini herhangi bir yere göndermiyoruz.</li>
      </ul>

      <h2 className={s.h2}>Tarayıcınızda ne saklanır?</h2>
      <ul>
        <li>
          <strong>Tema tercihi:</strong> aydınlık veya koyu seçiminiz, tarayıcınızın yerel
          belleğinde (localStorage) tutulur. Kişisel bilgi içermez.
        </li>
        <li>
          <strong>Taslaklar:</strong> varsayılan olarak kapalıdır. Açarsanız taslaklar yalnızca bu
          tarayıcının yerel belleğinde saklanır; T.C. kimlik numarası hiçbir zaman kaydedilmez.
          Taslakları tek tek veya toplu silebilir, JSON olarak dışa aktarabilirsiniz.
        </li>
      </ul>

      <h2 className={s.h2}>Bağlantılar</h2>
      <p>
        Bazı sayfalarda resmî kaynaklara (mevzuat.gov.tr gibi) bağlantılar vardır. Bu bağlantılara
        tıkladığınızda ilgili sitenin kendi gizlilik kuralları geçerli olur.
      </p>

      <p className={s.note}>
        Dilekçem hukuki danışmanlık vermez. Metinler örnektir; durumunuza göre uyarlayın, gerekirse
        avukata danışın.
      </p>
    </div>
  )
}

export function About() {
  return (
    <div className={`${s.page} ${s.prose}`}>
      <Seo
        title="Hakkında"
        description="Dilekçem, günlük hayatta sık karşılaşılan başvurular için hazır, resmî dille yazılmış metinler sunan bağımsız bir araçtır."
        path="/hakkinda"
      />
      <h1 className={s.h1}>Hakkında</h1>
      <p className={s.lead}>
        Dilekçem, günlük hayatta sık karşılaşılan başvurular için resmî dille hazırlanmış örnek
        metinler sunar.
      </p>
      <h2 className={s.h2}>Ne yapar?</h2>
      <p>
        Sorununuzu seçersiniz, birkaç soruyu yanıtlarsınız; metin kâğıt önizlemesinde anında oluşur.
        PDF, Word veya düz metin olarak indirebilir, yazdırabilirsiniz. Her şablon için başvuru
        yeri, süre ve gerekli belgeler de gösterilir.
      </p>
      <h2 className={s.h2}>Ne yapmaz?</h2>
      <p>
        Hukuki danışmanlık vermez, avukatın yerini tutmaz, başvurunuzu sizin adınıza iletmez.
        Mevzuat bilgileri resmî kaynaklardan derlenir ve her kayıtta kaynak ile doğrulama tarihi
        gösterilir; doğrulanamayan bilgiler "doğrulanmalı" olarak işaretlenir. Ayrıntı için{' '}
        <Link to="/veri-kaynaklari">veri kaynakları</Link> sayfasına bakın.
      </p>
      <h2 className={s.h2}>Gizlilik</h2>
      <p>
        Sunucu yoktur; yazdıklarınız cihazınızdan çıkmaz. <Link to="/gizlilik">Gizlilik</Link>{' '}
        sayfasında ayrıntılar var.
      </p>
    </div>
  )
}

const mevzuat = mevzuatListSchema.parse(mevzuatJson)

export function DataSources() {
  const unverified = merciler.filter((m) => !m.verified)
  return (
    <div className={`${s.page} ${s.prose}`}>
      <Seo
        title="Veri kaynakları"
        description="Dilekçem'deki süre, parasal sınır, merci ve kanun maddesi bilgilerinin kaynakları ve doğrulama tarihleri."
        path="/veri-kaynaklari"
      />
      <h1 className={s.h1}>Veri kaynakları</h1>
      <p className={s.lead}>
        Süre, parasal sınır, merci adı ve kanun maddesi gibi bilgiler kodda değil, veri dosyalarında
        tutulur. Her kaydın kaynağı ve doğrulama tarihi aşağıdadır.
      </p>

      <h2 className={s.h2}>Başvuru mercileri</h2>
      <ul className={s.sourceList}>
        {merciler.map((m) => (
          <li key={m.id}>
            <div className={s.sourceHead}>
              <strong>{m.ad}</strong>
              <VerifiedBadge verified={m.verified} date={m.dogrulamaTarihi} />
            </div>
            <p>
              <a href={m.kaynakUrl} target="_blank" rel="noopener noreferrer">
                Kaynak
              </a>
              {' · '}Geçerlilik: {formatLongDate(m.validFrom)}
              {m.validTo ? ` – ${formatLongDate(m.validTo)}` : ' ve sonrası'}
            </p>
            {m.not && <p className={s.note}>{m.not}</p>}
          </li>
        ))}
      </ul>

      <h2 className={s.h2}>Kanun maddeleri</h2>
      <ul className={s.sourceList}>
        {mevzuat.map((m) => (
          <li key={m.id}>
            <div className={s.sourceHead}>
              <strong>{m.atif}</strong>
              <VerifiedBadge verified={m.verified} date={m.dogrulamaTarihi} />
            </div>
            <p>{m.ozet}</p>
            <p>
              <a href={m.kaynakUrl} target="_blank" rel="noopener noreferrer">
                Kaynak
              </a>
            </p>
          </li>
        ))}
      </ul>

      {unverified.length > 0 && (
        <>
          <h2 className={s.h2}>Hukuki inceleme gerektirenler</h2>
          <ul>
            {unverified.map((m) => (
              <li key={m.id}>
                <strong>{m.ad}:</strong> {m.not}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
