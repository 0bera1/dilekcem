import { readFileSync } from 'node:fs'
import { SAMPLE, expect, fillAbonelik, paper, test } from './fixtures'

// Runs against a deployed site with BASE_URL, e.g. BASE_URL=https://dilekcem.beraekimci.com.tr
test.describe('smoke', () => {
  test('home, template page, 404, sitemap and robots', async ({ page, request }) => {
    expect((await page.goto('/'))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect((await page.goto('/dilekce/abonelik-iptali'))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Abonelik iptali dilekçesi')
    expect((await page.goto('/yok-sayfa'))?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Sayfa bulunamadı' })).toBeVisible()
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('/dilekce/abonelik-iptali')
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
  })

  test('theme toggle and a real PDF download', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Koyu tema/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await fillAbonelik(page)
    await expect(paper(page)).toContainText(SAMPLE.adSoyad)
    const [pdf] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PDF olarak indir' }).click(),
    ])
    expect(
      readFileSync((await pdf.path())!)
        .subarray(0, 5)
        .toString(),
    ).toBe('%PDF-')
  })

  test('response carries the CSP meta tag', async ({ page }) => {
    await page.goto('/')
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content')
    expect(csp).toContain("default-src 'self'")
  })
})
