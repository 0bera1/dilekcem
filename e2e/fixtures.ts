import { expect, test as base, type Page } from '@playwright/test'

export const SAMPLE = {
  adSoyad: 'Ayşe Yılmaz',
  tckn: '10000000146',
  adres: 'Örnek Mah. Deneme Sok. No: 5 Çankaya / Ankara',
  telefon: '0532 123 45 67',
  eposta: 'ayse@ornek.com',
}

/** Every page fails its test on console errors/warnings, uncaught exceptions and CSP violations. */
export const test = base.extend<{ issues: string[] }>({
  issues: [
    async ({ page }, use) => {
      const issues: string[] = []
      // Browsers log a console error for any 404 document; the 404 page is a deliberate navigation.
      let expected404 = 0
      page.on('response', (r) => {
        if (r.status() === 404 && r.request().resourceType() === 'document') expected404 += 1
      })
      page.on('console', (m) => {
        if (m.type() !== 'error' && m.type() !== 'warning') return
        if (/status of 404/.test(m.text()) && expected404 > 0) {
          expected404 -= 1
          return
        }
        issues.push(`${m.type()}: ${m.text()}`)
      })
      page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`))
      await use(issues)
      expect(issues, 'console / CSP issues').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export async function fillSender(page: Page): Promise<void> {
  await page.getByLabel('Ad Soyad').fill(SAMPLE.adSoyad)
  await page.getByLabel(/T\.C\. Kimlik No/).fill(SAMPLE.tckn)
  await page.getByLabel('Adres', { exact: true }).fill(SAMPLE.adres)
  await page.getByLabel(/Telefon/).fill(SAMPLE.telefon)
  await page.getByLabel(/E-posta/).fill(SAMPLE.eposta)
}

export async function fillAbonelik(page: Page): Promise<void> {
  await fillSender(page)
  await page.getByLabel('Firma adı').fill('Örnek İletişim A.Ş.')
  await page.getByLabel('İptal edilecek hizmet').fill('Sabit internet aboneliği')
}

export const paper = (page: Page) => page.getByRole('region', { name: 'Dilekçe önizlemesi' })

export const ALL_PATHS = [
  '/',
  '/dilekce',
  '/dilekce/abonelik-iptali',
  '/dilekce/tuketici-hakem-heyeti-basvurusu',
  '/dilekce/trafik-cezasi-itirazi',
  '/basvuru-yolu',
  '/gizlilik',
  '/hakkinda',
  '/veri-kaynaklari',
  '/404',
]
