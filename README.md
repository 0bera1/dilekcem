# Dilekçem

Hazır dilekçe ve başvuru metni sitesi. Kullanıcı sorununu seçer, birkaç soruyu yanıtlar; resmî dille hazırlanmış metin kâğıt önizlemesinde anında belirir. PDF, Word veya düz metin olarak indirir. Her şablon için "nereye, ne zaman, hangi belgelerle başvurulur?" bilgisi de gösterilir.

- Canlı adres: https://dilekcem.beraekimci.com.tr
- **Sunucu veya arka uç yoktur.** Her şey tarayıcıda çalışır; kullanıcı girdisi hiçbir yere gönderilmez.
- Dilekçem hukuki danışmanlık vermez. Metinler örnektir; durumunuza göre uyarlayın, gerekirse avukata danışın.

## İçindekiler

1. [Kurulum](#kurulum)
2. [Geliştirme](#geliştirme)
3. [Test komutları](#test-komutları)
4. [Şablon ekleme rehberi](#şablon-ekleme-rehberi)
5. [Merci ve mevzuat verisini güncelleme](#merci-ve-mevzuat-verisini-güncelleme)
6. [Dağıtım ve DNS](#dağıtım-ve-dns)
7. [Gizlilik ilkesi](#gizlilik-ilkesi)
8. [Kararlar](#kararlar)
9. [Hukuki inceleme gerektirenler](#hukuki-inceleme-gerektirenler)

## Kurulum

Gereksinimler: Node 24 LTS (en az 22), npm.

```bash
npm ci
npx playwright install --with-deps chromium   # yalnızca e2e testleri için
```

Gerçek değer içeren dosya repoya konmaz. Ortam değişkeni adları için `.env.example` dosyasına bakın; gerçek `.env` dosyası `.gitignore` içindedir.

## Geliştirme

```bash
npm run dev          # geliştirme sunucusu
npm run build        # statik derleme: dist/ (her rota için ön-render edilmiş HTML, 404.html, sitemap.xml)
npm run preview      # derlemeyi Vite ile sun
node scripts/serve-dist.mjs   # dist/ klasörünü GitHub Pages gibi sun (404.html ile)
npm run lint && npm run typecheck && npm run format
```

Yapı:

| Yol               | İçerik                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| `src/templates/`  | Şablon motoru (`engine.ts`) ve kategoriye göre şablonlar                          |
| `src/data/`       | Mevzuat verisi: `merciler.json`, `mevzuat.json`, `karar-agaci.json` ve zod şeması |
| `src/lib/`        | Türkçe yardımcılar, T.C. kimlik algoritması, doğrulama, tarih, süre, taslaklar    |
| `src/export/`     | PDF (pdf-lib), DOCX (docx), takvim hatırlatıcısı (.ics)                           |
| `src/components/` | Arayüz bileşenleri (CSS Modules)                                                  |
| `src/pages/`      | Sayfalar                                                                          |
| `e2e/`            | Playwright testleri                                                               |
| `scripts/`        | Derleme sonrası betik, veri/bağlantı/sır denetimleri, yazı tipi aracı             |

## Test komutları

| Komut                    | Ne yapar                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `npm test`               | Birim ve bileşen testleri (Vitest, Testing Library)                                                   |
| `npm run test:pdf`       | Her şablon için PDF ve DOCX üretir; pdfjs ile metni, A4 ölçüsünü, Türkçe karakterleri doğrular        |
| `npm run test:e2e`       | Tüm Playwright testleri (masaüstü ve mobil): akış, ağ gizliliği, görsel regresyon, dayanıklılık, SEO  |
| `npm run test:a11y`      | axe: tüm sayfalar, aydınlık/koyu, 390/1280 px                                                         |
| `npm run test:e2e:smoke` | Duman testi. Canlı site için: `BASE_URL=https://dilekcem.beraekimci.com.tr npm run test:e2e:smoke`    |
| `npm run lighthouse`     | Lighthouse CI, mobil ve masaüstü, dört kategori ≥ 90                                                  |
| `npm run check:data`     | Veri şemaları, şablon-veri bağları, kaynak URL'lerinin yanıt vermesi, 12 aydan eski doğrulama uyarısı |
| `npm run check:links`    | `dist/` içindeki iç ve dış bağlantıları denetler                                                      |
| `npm run check:secrets`  | Çalışma ağacında ve tüm git geçmişinde token biçimlerini arar; gitleaks (yoksa secretlint) çalıştırır |
| `npm run audit`          | `npm audit --omit=dev --audit-level=high`                                                             |

Playwright testleri derlenmiş siteye karşı çalışır; önce `npm run build` çalıştırın. Her e2e testi konsol hatası, CSP ihlali veya yakalanmamış istisna olursa kırılır.

Görsel regresyon referansları platforma göre saklanır (`e2e/__screenshots__/<platform>/`). Windows referansları repoda; Linux referansları CI'ın ilk çalışmasında yazılır (`--update-snapshots=missing`) ve rapor artifact'ından alınıp commit edilebilir. Arayüzü bilerek değiştirdiyseniz: `npx playwright test --update-snapshots --grep "visual regression"`.

## Şablon ekleme rehberi

1. `src/templates/<kategori>/<slug>.ts` dosyası oluşturun ve `TemplateDef` döndürün. Mevcut bir şablonu örnek alın (`abonelik-iptali.ts`).
   - `fields`: şablona özel alanlar. `step: 2` olanlar "Kime yazıyorsun?", varsayılan `step: 3` olanlar "Ayrıntılar" adımında görünür. Ortak alanlar (ad, adres, tarih...) `COMMON_FIELDS` içindedir.
   - `muhatap()`, `konu()`, `body()`, `ekler()`: saf fonksiyonlar. `c.v('alan')` boşsa `[Alan Adı]` yer tutucusu döner.
   - **Kullanıcı girdisine Türkçe ek yapıştırmayın** ("X'e", "Y'nin"). Cümleleri "Muhatap: X", "Ürün: Y" gibi ek gerektirmeyecek şekilde kurun.
   - **Süre, parasal sınır ve kanun maddesini koda yazmayın.** `c.law('kimlik')`, `c.sure('süre-id')`, `c.sinir('sınır-id')` ile veri dosyalarından alın. SSS metinlerinde `{{sure:id}}`, `{{sure:merci/id}}` ve `{{sinir:id}}` belirteçleri kullanılır.
   - `where.merciId`: `merciler.json` içindeki bir kayıt.
   - `reminders`: süre hatırlatıcısı (.ics) için başlangıç tarihi alanı ve `sureler[].id`.
2. Şablonu `src/templates/index.ts` içindeki `templates` listesine ekleyin ve `src/data/karar-agaci.json` içinde bir sonuca bağlayın.
3. `npm test` çalıştırın. Testler meta veriyi, merci bağını, hatırlatıcıları, SSS belirteçlerini, boş veri davranışını ve örnek veriyle anlık görüntüyü kontrol eder. Yeni şablonun anlık görüntüsü ilk çalıştırmada yazılır; metni okuyup onaylayın.
4. Yeni rota otomatik ön-render edilir ve `sitemap.xml` içine girer (`getStaticPaths`, `src/routes.tsx`).

## Merci ve mevzuat verisini güncelleme

- `src/data/merciler.json`: merci adı, başvuru yolu, süreler, parasal sınırlar, gerekli belgeler, `kaynakUrl`, `dogrulamaTarihi`, `verified`, `validFrom`, `validTo`.
- `src/data/mevzuat.json`: kanun maddesi atıfı (ek almış hâliyle, örn. "…Kanun'un 48. maddesi"), özet, kaynak, doğrulama tarihi.
- Bilgiyi **resmî kaynaktan** (mevzuat.gov.tr, Resmî Gazete, ticaret.gov.tr, cimer.gov.tr, kvkk.gov.tr, ilgili kurum siteleri) doğrulayın; hafızadan yazmayın. Doğrulayamadığınızı `verified: false` yapın ve `not` alanına nedenini yazın. Arayüzde "Doğrulanmalı" rozeti çıkar ve kayıt aşağıdaki listeye girer.
- Her yılbaşı **tüketici hakem heyeti parasal sınırı** değişir (Ticaret Bakanlığı duyurusu). `tuketici-hakem-heyeti` kaydındaki `sinir-2026` tutarını, `validFrom`/`validTo` değerlerini ve `dogrulamaTarihi` alanını güncelleyin. Yeni yıl için yeni bir `sinir-YYYY` kimliği açıp şablondaki `c.sinir(...)` çağrılarını güncelleyin.
- `npm run check:data` şemayı, bağları ve kaynak URL'lerini denetler.
- Önizlemede gösterilen son günler takvim günü olarak hesaplanır; "iş günü" hesabı yalnızca hafta sonlarını atlar, resmî tatilleri bilmez (arayüzde bu not gösterilir).

## Dağıtım ve DNS

Site GitHub Pages üzerinde, `.github/workflows/deploy.yml` ile yayınlanır (`main` push'u veya elle tetikleme). İş akışı: lint, test, derleme, Pages artifact'ı, dağıtım ve ardından canlı adrese duman testi.

1. Repo ayarlarında **Pages → Build and deployment → Source: GitHub Actions** (API ile: `build_type=workflow`).
2. Özel alan adı: `public/CNAME` içeriği tam olarak `dilekcem.beraekimci.com.tr`. Pages ayarında aynı alan adı tanımlı olmalıdır.
3. Cloudflare DNS: `dilekcem` adlı **CNAME** kaydı, hedef `<github-kullanıcı-adı>.github.io`, **proxy kapalı (DNS only)**, TTL otomatik.
4. Zone'da Let's Encrypt'i engelleyen bir **CAA** kaydı olmamalıdır; yoksa GitHub sertifika alamaz.
5. Sertifika "approved" olunca **Enforce HTTPS** açılır.
6. İsteğe bağlı güvenlik: GitHub hesabında alan adı doğrulaması (Settings → Pages → Add a domain, TXT kaydı). Site bu adım olmadan da çalışır; adım, alan adının başkası tarafından Pages'e bağlanmasını (takeover) engeller.

Cloudflare proxy (turuncu bulut) bilerek açılmaz. Açılırsa Transform Rules ile `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` ve `Content-Security-Policy` / `frame-ancestors` başlıkları eklenebilir; ayrıca TLS modu "Full (strict)" olmalıdır.

Token'lar yalnızca ortam değişkenlerindedir (`CF_API_TOKEN`, `GH_TOKEN`, `GH_TOKEN_CLASSIC`); hiçbir dosyaya, commit'e veya remote URL'ye yazılmaz. CI'da Cloudflare token'ı kullanılmaz.

## Gizlilik ilkesi

- Sunucu yoktur. Ad, adres, T.C. kimlik no, telefon, e-posta ve olay anlatımı yalnızca tarayıcıda işlenir; önizleme, PDF, Word ve metin çıktıları tarayıcıda üretilir.
- Çerez, analitik, izleyici, reklam, dış CDN ve dış yazı tipi isteği yoktur. Yazı tipleri sitenin kendisinden sunulur. Ağ gizlilik testi (`e2e/privacy.spec.ts`) kendi alan adı dışına çıkan her isteği ve kullanıcı girdisi taşıyan her isteği yakalar; başarısız olursa CI kırılır.
- Yerel depolama: yalnızca tema tercihi ve (açılırsa) taslaklar. Taslak saklama **varsayılan kapalıdır**; açıldığında yalnızca `localStorage` kullanılır, taslaklar silinebilir ve JSON olarak dışa aktarılabilir. **T.C. kimlik numarası hiçbir zaman saklanmaz.**
- Depolama engelliyse (özel pencere, çerez engeli) uygulama sessizce bellek içi çalışmaya döner.

## Kararlar

- **Node 24 LTS (en az 22).** Görev Node 20+ diyordu; Node 20 bakım ömrünü Nisan 2026'da doldurdu ve test ortamı jsdom 30'un bağımlılığı (undici) Node 20'de yüklenemiyor. CI ve dağıtım Node 24 kullanır, `engines` alanı `>=22` ister.
- **React 18 + react-router-dom 6 + vite-react-ssg.** Şablon Vite'ın React 19'unu getiriyordu; vite-react-ssg `react-router-dom@^6` ister ve görev React 18 diyor. Bu yüzden ikisi sabitlendi. Dependabot bu ikisinin ana sürüm yükseltmelerini önermez.
- **`npm audit` iki orta şiddetli bulgu verir (react-router 6).** Biri kullanıcı kaynaklı `<Link to>` ile açık yönlendirme, diğeri SSR hata serileştirmesidir; sitede kullanıcı kaynaklı `to` yoktur ve hydration verisi sabittir. Düzeltme React Router 7 gerektirir (vite-react-ssg desteklemiyor). Yüksek/kritik bulgu yoktur; `npm run audit` bunu zorunlu kılar.
- **ESLint 9.** `eslint-plugin-jsx-a11y` henüz ESLint 10'u desteklemiyor.
- **Statik HTML.** Her rota derleme sırasında ön-render edilir; ayrı bir SPA yönlendirmesi gerekmez. `404` rotası da ön-render edilip `dist/404.html` olarak kopyalanır, GitHub Pages bilinmeyen yollarda bunu 404 durum koduyla sunar. `sitemap.xml` derlemenin gerçekten ürettiği sayfalardan yazılır.
- **CSP meta etiketi.** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`. `unsafe-inline` yoktur: CSS Modules ve satır içi stil kullanılmaz (kritik CSS satır içine alma kapalı). vite-react-ssg ve tema betiği sayfaya iki-üç satır içi betik koyar; bunlar derleme sonrası betikte **SHA-256 özetiyle** tek tek izinlenir (`scripts/postbuild.mjs`). Tema betiğinin satır içi olması ilk boyamada tema titremesini ve bir istek gecikmesini önler. `frame-ancestors` yönergesi meta etiketiyle etkisizdir (tarayıcılar yalnızca HTTP başlığında dikkate alır); çerçeveleme koruması için Cloudflare Transform Rules gerekir (yukarıya bakın).
- **zod yalnızca testlerde ve betiklerde.** Veri dosyaları testlerde ve `check:data` içinde şemaya karşı doğrulanır; tarayıcı paketine zod konmaz. Taslak içe aktarma elle yazılmış katı bir doğrulayıcı kullanır.
- **Türkçe ekler.** Şablonlar kullanıcı girdisine ek yapıştırmayacak şekilde kuruldu; ünlü uyumu yardımcısı gerekmedi. Büyük harf `toLocaleUpperCase('tr-TR')` ile; arama karşılaştırmaları tr-TR duyarlıdır ve Türkçe karakter yazamayan klavyeler için aksanları da katlar ("kisisel" → "Kişisel").
- **Yazı tipleri.** Web için Source Serif 4 (400/600/700) ve Instrument Sans (400/500/600/700) Latin + Türkçe alt kümesiyle tek dosya/ağırlık olarak sunulur (`scripts/build-fonts.mjs`); PDF için tam Source Serif 4 TTF'leri (Regular/Bold/Italic) gömülür. Lisanslar `public/fonts/` içindedir (SIL OFL).
- **PDF/DOCX kütüphaneleri tembel yüklenir.** Form alanlarından birine ilk odaklanıldığında önceden yüklenir; böylece indirme çevrimdışı da çalışır ama ilk açılış hafif kalır.
- **Taslaklar** T.C. kimlik numarasını içermez ve varsayılan olarak kapalıdır.
- **Tarih alanı** istemcide, bağlandıktan sonra bugüne ayarlanır; ön-render edilen HTML ile ilk istemci çıktısının eşleşmesi için.
- **Vitest ayrı yapılandırma dosyalarında** (`vitest.config.ts` birim/bileşen, `vitest.pdf.config.ts` PDF testi, Node ortamı).
- **Sır taraması.** `gitleaks` kurulu değilse `check:secrets` secretlint'e düşer ve ek olarak tüm git geçmişini bilinen token biçimleri için kendisi tarar. CI'da gitleaks-action çalışır.

## Hukuki inceleme gerektirenler

Aşağıdakiler resmî kaynaktan **doğrulanamadı** ve arayüzde "Doğrulanmalı" rozetiyle gösterilir. Kesin bilgi olarak sunulmaz; şablon metinleri bu konularda kesin süre veya madde belirtmez.

- **Banka ücret ve kesinti itirazı** (`banka`): bankaların cevap süresi ve ücret kalemlerine ilişkin düzenleme doğrulanamadı.
- **Kargo hasarı ve kayıp bildirimi** (`kargo-firmasi`): posta/kargo hizmetlerinde hasar bildirim süreleri ve firma sorumluluğuna ilişkin hükümler doğrulanamadı.
- **Trafik cezası itirazı** (`sulh-ceza`): 15 günlük süre 5326 sayılı Kabahatler Kanunu'nun 27. maddesinden doğrulandı; ancak başvurulacak mercinin güncel adı (mahkeme/hâkimlik) ve yetki kuralları hukuken kontrol edilmelidir.
- **Mazeret dilekçesi** (`okul-idaresi`): devamsızlık sınırları ve mazeret bildirim süreleri kurumdan kuruma değişir; ilgili yönetmelik doğrulanmadı.
- **Belge talebi** (`belge-veren-kurum`): özel kurum ve işyerlerinde belge verme süresi doğrulanmadı; kamu kurumları için bilgi edinme süreleri geçerlidir.

Ayrıca:

- Tüketici hakem heyeti parasal sınırı (2026: 186.000 TL) Ticaret Bakanlığı'nın tüketici hakem heyetleri bilgilendirme sayfasından doğrulandı. Kanunun 68. maddesindeki dipnot, tutarın 23/12/2025 tarihli ve 33116 sayılı Resmî Gazete'deki tebliğle belirlendiğini söyler; tebliğin tablosu bu çalışmada doğrudan okunamadı.
- Mesafeli Sözleşmeler Yönetmeliği'nin ayrıntıları (iade süreleri, istisnalar) kullanılmadı; metinler yalnızca 6502 sayılı Kanun'un doğrulanan maddelerine dayanır.
- Şablon metinleri avukat incelemesinden geçmemiştir. Yayın öncesi ve her mevzuat değişikliğinde gözden geçirilmelidir.
- 6502 sayılı Kanun'un ayıplı hizmetlere ilişkin hükümleri (m. 13-16) şablonlarda kullanılmadı.
