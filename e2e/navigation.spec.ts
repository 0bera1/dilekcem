import { expect, paper, test } from './fixtures'

test.describe('navigation and interaction', () => {
  test('theme toggle works, persists and does not flash', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(await bg()).toBe('rgb(242, 244, 248)')
    await page.getByRole('button', { name: /Koyu tema/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await bg()).toBe('rgb(13, 18, 32)')
    // The paper stays light in the dark theme.
    expect(
      await page.locator('#onizleme').evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(246, 241, 230)')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await bg()).toBe('rgb(13, 18, 32)')
  })

  test('follows the system theme until a choice is made', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/dilekce')
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      'rgb(13, 18, 32)',
    )
  })

  test('category tabs work with the keyboard', async ({ page }) => {
    await page.goto('/')
    const first = page.getByRole('tab', { name: 'Tüketici' })
    await first.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Kamu' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Kamu' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('button', { name: /Trafik cezası itiraz/ })).toBeVisible()
    await page.keyboard.press('End')
    await expect(page.getByRole('tab', { name: 'Rehber' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: 'Sorununuz hangi alanda?' })).toBeVisible()
  })

  test('skip link jumps to the content', async ({ page }) => {
    await page.goto('/gizlilik')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'İçeriğe atla' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#icerik$/)
  })

  test('hub search is Turkish-aware and filters by category', async ({ page }) => {
    await page.goto('/dilekce')
    await expect(page.getByText('18 şablon listeleniyor.')).toBeVisible()
    await page.getByLabel('Şablon ara').fill('ISTIFA')
    await expect(page.getByRole('link', { name: /İstifa dilekçesi/ })).toBeVisible()
    await expect(page.getByText('1 şablon listeleniyor.')).toBeVisible()
    await page.getByLabel('Şablon ara').fill('')
    await page.getByLabel('Kategori').selectOption('kamu')
    await expect(page.getByText('4 şablon listeleniyor.')).toBeVisible()
    await page.getByLabel('Şablon ara').fill('zzzzzz')
    await expect(page.getByText('Eşleşen şablon yok.')).toBeVisible()
  })

  test('hub rows open the template page', async ({ page }) => {
    await page.goto('/dilekce')
    await page.getByRole('link', { name: /İstifa dilekçesi/ }).click()
    await expect(page).toHaveURL(/\/dilekce\/istifa-dilekcesi$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('İstifa dilekçesi')
  })

  test('application path finder leads to the right template', async ({ page }) => {
    await page.goto('/basvuru-yolu')
    await page.getByRole('button', { name: /Satın aldığım ürün/ }).click()
    await page.getByRole('button', { name: /arızalı veya eksik/ }).click()
    await expect(page.getByText('Size uygun şablon')).toBeVisible()
    await expect(page.getByText(/Satıcı veya hizmet sağlayıcı firma/)).toBeVisible()
    await page.getByRole('link', { name: /Dilekçeyi hazırla/ }).click()
    await expect(page).toHaveURL(/\/dilekce\/ayipli-urun$/)
    await expect(paper(page)).toContainText('Ayıplı ürün hakkında talep')
  })

  test('unknown URLs show the 404 page with status 404', async ({ page }) => {
    const res = await page.goto('/yok-boyle-bir-sayfa')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Sayfa bulunamadı' })).toBeVisible()
    await page.getByRole('link', { name: 'Tüm şablonlar' }).click()
    await expect(page).toHaveURL(/\/dilekce$/)
    const res2 = await page.goto('/dilekce/olmayan-sablon')
    expect(res2?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Sayfa bulunamadı' })).toBeVisible()
  })
})

test.describe('drafts', () => {
  test('off by default; save, reload, export and delete when on', async ({ page }) => {
    await page.goto('/dilekce/abonelik-iptali')
    expect(await page.evaluate(() => window.localStorage.getItem('dilekcem:drafts'))).toBeNull()
    await page.getByText('Taslaklarım').click()
    await page.getByLabel('Ad Soyad').fill('Ayşe Yılmaz')
    await page.getByLabel(/T\.C\. Kimlik No/).fill('10000000146')
    await page.getByLabel('Taslak saklamayı aç').check()
    await page.getByRole('button', { name: /Bu taslağı kaydet/ }).click()
    await expect(page.getByText('Taslak bu cihazda kaydedildi')).toBeVisible()
    const stored = await page.evaluate(() => window.localStorage.getItem('dilekcem:drafts'))
    expect(stored).toContain('Ayşe Yılmaz')
    expect(stored).not.toContain('10000000146')

    await page.reload()
    await page.getByText('Taslaklarım').click()
    await expect(page.getByLabel('Taslak saklamayı aç')).toBeChecked()
    await page.getByLabel('Ad Soyad').fill('')
    await page.getByRole('button', { name: 'Yükle' }).click()
    await expect(page.getByLabel('Ad Soyad')).toHaveValue('Ayşe Yılmaz')

    const [json] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Dışa aktar/ }).click(),
    ])
    expect(json.suggestedFilename()).toBe('dilekcem-taslaklar.json')

    await page.getByRole('button', { name: /taslağını sil/ }).click()
    await expect(page.getByText('Kayıtlı taslak yok.')).toBeVisible()
    expect(await page.evaluate(() => window.localStorage.getItem('dilekcem:drafts'))).toBe('[]')
  })
})
