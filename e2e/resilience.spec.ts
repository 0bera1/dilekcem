import { SAMPLE, expect, fillAbonelik, paper, test } from './fixtures'

test('the page keeps working while offline', async ({ page, context }) => {
  await page.goto('/dilekce/abonelik-iptali')
  // Focusing the form starts the export prefetch; wait for it before going offline.
  await page.getByLabel('Ad Soyad').focus()
  await page.waitForLoadState('networkidle')
  await context.setOffline(true)
  await page.getByLabel('Ad Soyad').fill(SAMPLE.adSoyad)
  await expect(paper(page)).toContainText(SAMPLE.adSoyad)
  await page.getByRole('button', { name: /Koyu tema/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  // Prefetched exporters work without any network.
  await page.getByLabel('Adres', { exact: true }).fill(SAMPLE.adres)
  await page.getByLabel('Firma adı').fill('Örnek A.Ş.')
  await page.getByLabel('İptal edilecek hizmet').fill('Internet')
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'PDF olarak indir' }).click(),
  ])
  expect(dl.suggestedFilename()).toBe('abonelik-iptali.pdf')
})

test('a failing PDF shows a clear message instead of breaking the page', async ({
  page,
  issues,
}) => {
  await page.route('**/fonts/SourceSerif4-*.ttf', (route) => route.abort())
  await page.goto('/dilekce/abonelik-iptali')
  await fillAbonelik(page)
  await page.getByRole('button', { name: 'PDF olarak indir' }).click()
  await expect(page.getByRole('alert')).toContainText('PDF oluşturulamadı')
  // The page still works and Word export is unaffected.
  await expect(paper(page)).toContainText(SAMPLE.adSoyad)
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Word/ }).click(),
  ])
  expect(dl.suggestedFilename()).toBe('abonelik-iptali.docx')
  // The aborted font requests are the failure this test provokes on purpose.
  expect(issues.every((i) => /Failed to load resource|ERR_FAILED/.test(i))).toBe(true)
  issues.length = 0
})

test('works with localStorage blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const deny = (): never => {
      throw new DOMException('blocked', 'SecurityError')
    }
    Object.defineProperty(window, 'localStorage', {
      get: () => ({
        getItem: deny,
        setItem: deny,
        removeItem: deny,
        clear: deny,
        key: deny,
        length: 0,
      }),
    })
  })
  await page.goto('/dilekce/abonelik-iptali')
  await page.getByLabel('Ad Soyad').fill(SAMPLE.adSoyad)
  await expect(paper(page)).toContainText(SAMPLE.adSoyad)
  await page.getByRole('button', { name: /Koyu tema/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByText('Taslaklarım').click()
  await page.getByLabel('Taslak saklamayı aç').check()
  await page.getByRole('button', { name: /Bu taslağı kaydet/ }).click()
  await expect(page.getByText(/Taslak bu cihazda kaydedildi/)).toBeVisible()
})

test('stays usable on a slow network', async ({ page }) => {
  await page.route('**/*', async (route) => {
    await new Promise((r) => setTimeout(r, 150))
    await route.continue()
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByLabel('Ad Soyad').fill(SAMPLE.adSoyad)
  await expect(paper(page)).toContainText(SAMPLE.adSoyad)
})

test('works without JavaScript for reading (pre-rendered content)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/dilekce/abonelik-iptali')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Abonelik iptali dilekçesi')
  await expect(page.getByText('Sık sorulan sorular')).toBeVisible()
  await ctx.close()
})
