import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { ALL_PATHS, SAMPLE, expect, fillAbonelik, fillSender, paper, test } from './fixtures'

test.describe('main flow', () => {
  test('pick a template, fill it, see the paper and download PDF and DOCX', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Sorununu seç, dilekçen hazır olsun',
    )
    await fillAbonelik(page)

    await expect(paper(page)).toContainText('Ayşe Yılmaz')
    await expect(paper(page)).toContainText('ÖRNEK İLETİŞİM A.Ş.')
    await expect(paper(page)).toContainText('Sabit internet aboneliği')
    await expect(paper(page)).toContainText(SAMPLE.tckn)
    await expect(
      page
        .getByText('Bu metin örnektir; durumunuza göre uyarlayın, gerekirse avukata danışın.')
        .first(),
    ).toBeVisible()

    const [pdf] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PDF olarak indir' }).click(),
    ])
    expect(pdf.suggestedFilename()).toBe('abonelik-iptali.pdf')
    const bytes = readFileSync((await pdf.path())!)
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
    const { width, height } = doc.getPage(0).getSize()
    expect(width).toBeCloseTo(595.28, 0)
    expect(height).toBeCloseTo(841.89, 0)
    await expect(page.getByRole('status').filter({ hasText: 'PDF indirildi.' })).toBeVisible()

    const [docx] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Word \(\.docx\)/ }).click(),
    ])
    expect(docx.suggestedFilename()).toBe('abonelik-iptali.docx')
    expect(
      readFileSync((await docx.path())!)
        .subarray(0, 2)
        .toString(),
    ).toBe('PK')
  })

  test('copy puts the plain text on the clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await fillAbonelik(page)
    await page.getByRole('button', { name: 'Metni kopyala' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'panoya kopyalandı' })).toBeVisible()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toContain('Konu: Abonelik iptali talebi')
    expect(text).toContain('Ayşe Yılmaz')
    expect(text).toContain('Not: Bu metin örnektir')
  })

  test('required fields block export and focus the first problem', async ({ page }) => {
    await page.goto('/dilekce/abonelik-iptali')
    await page.getByRole('button', { name: 'PDF olarak indir' }).click()
    await expect(page.getByRole('alert')).toContainText('zorunlu alanlar')
    await expect(page.getByLabel('Ad Soyad')).toBeFocused()
    await expect(page.getByText('Bu alan zorunludur.').first()).toBeVisible()
  })

  test('invalid values show messages tied to the fields', async ({ page }) => {
    await page.goto('/dilekce/abonelik-iptali')
    await page.getByLabel(/E-posta/).fill('yanlis')
    await page.getByLabel(/Telefon/).fill('123')
    await page.getByLabel(/T\.C\. Kimlik No/).fill('11111111111')
    await page.getByLabel('Ad Soyad').click()
    await expect(page.getByText(/Geçerli bir e-posta/)).toBeVisible()
    await expect(page.getByText(/Geçerli bir telefon/)).toBeVisible()
    await expect(page.getByText(/11 haneli ve geçerli/)).toBeVisible()
    await expect(page.getByLabel(/E-posta/)).toHaveAttribute('aria-invalid', 'true')
  })

  test('very long text still produces a multi-page PDF', async ({ page }) => {
    await page.goto('/dilekce/ayipli-urun')
    await fillSender(page)
    await page.getByLabel('Satıcı firma adı').fill('Örnek Mağaza')
    await page.getByLabel('Ürün adı ve modeli').fill('Örnek Ürün X1')
    await page.getByLabel('Teslim aldığınız tarih').fill('2026-03-01')
    await page
      .getByLabel('Ayıbın açıklaması')
      .fill(
        Array.from(
          { length: 24 },
          (_, i) => `Paragraf ${i + 1}: ${'ğüşiöçİı uzun metin '.repeat(6)}`,
        ).join('\n'),
      )
    await page.getByLabel('Talebiniz').selectOption('onarim')
    const [pdf] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PDF olarak indir' }).click(),
    ])
    const doc = await PDFDocument.load(readFileSync((await pdf.path())!))
    expect(doc.getPageCount()).toBeGreaterThan(1)
  })

  test('the .ics reminder downloads with a computed date', async ({ page }) => {
    await page.goto('/dilekce/urun-iadesi-cayma')
    await page.getByLabel('Teslim aldığınız tarih').fill('2026-03-10')
    await expect(page.locator('p', { hasText: 'Cayma hakkı süresi bitiyor:' })).toContainText(
      '24 Mart 2026',
    )
    const [ics] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Hatırlatıcı \(\.ics\)/ }).click(),
    ])
    expect(ics.suggestedFilename()).toBe('urun-iadesi-cayma-hatirlatici.ics')
    const text = readFileSync((await ics.path())!, 'utf8')
    expect(text).toContain('BEGIN:VCALENDAR')
    expect(text).toContain('DTSTART;VALUE=DATE:20260324')
    expect(text).toContain('SUMMARY:Cayma hakkı süresi bitiyor')
  })

  test('hakem heyeti shows the verified 2026 limit and warns above it', async ({ page }) => {
    await page.goto('/dilekce/tuketici-hakem-heyeti-basvurusu')
    await expect(page.getByText('186.000 TL').first()).toBeVisible()
    await page.getByLabel('Uyuşmazlığın değeri (TL)').fill('250000')
    await expect(paper(page)).toContainText('[Dikkat: Uyuşmazlık değeri 250.000 TL')
  })

  test('unverified data carries the "Doğrulanmalı" badge', async ({ page }) => {
    await page.goto('/dilekce/trafik-cezasi-itirazi')
    await expect(page.getByText('Doğrulanmalı').first()).toBeVisible()
    await page.goto('/dilekce/abonelik-iptali')
    await expect(page.getByText(/Doğrulandı: 26 Ekim 2026/).first()).toBeVisible()
  })

  test('print stylesheet leaves only the paper', async ({ page }) => {
    await page.goto('/')
    await fillAbonelik(page)
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('#onizleme')).toBeVisible()
    await expect(page.getByRole('banner')).toBeHidden()
    await expect(page.getByRole('button', { name: 'PDF olarak indir' })).toBeHidden()
  })

  test('all pages exist and have the expected h1', async ({ page }) => {
    for (const p of ALL_PATHS) {
      const res = await page.goto(p)
      expect(res?.status(), p).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    }
  })
})
