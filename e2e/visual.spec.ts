import { ALL_PATHS, expect, test } from './fixtures'

const PAGES: [string, string][] = [
  ['home', '/'],
  ['template', '/dilekce/abonelik-iptali'],
  ['hub', '/dilekce'],
  ['404', '/404'],
]

test.describe('visual regression', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const [name, path] of PAGES) {
      test(`${name} ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme })
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready)
        await page.waitForLoadState('networkidle')
        // The date defaults to today; freeze the visible value so screenshots are stable.
        await page.evaluate(() => {
          document
            .querySelectorAll<HTMLInputElement>('input[type=date]')
            .forEach((i) => (i.style.color = 'transparent'))
        })
        await expect(page).toHaveScreenshot(`${name}-${scheme}.png`, {
          fullPage: false,
          mask: [page.locator('#onizleme')],
          maxDiffPixelRatio: 0.02,
        })
      })
    }
  }
})

test.describe('no horizontal scroll', () => {
  for (const width of [390, 768, 1280]) {
    test(`all pages at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of [...ALL_PATHS, '/dilekce/kargo-hasari', '/dilekce/izin-talebi']) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        expect(scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(clientWidth)
      }
    })
  }

  test('long unbroken input does not break the layout at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dilekce/ayipli-urun')
    await page.getByLabel('Ayıbın açıklaması').fill('x'.repeat(900))
    await page.getByLabel('Ad Soyad').fill('Ş'.repeat(100))
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })
})

test('the paper is readable in both themes (dark ink on light paper)', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/')
    const { bg, fg } = await page.locator('#onizleme').evaluate((el) => {
      const c = el.querySelector('p')!
      return { bg: getComputedStyle(el).backgroundColor, fg: getComputedStyle(c).color }
    })
    const lum = (rgb: string): number => {
      const [r, g, b] = (rgb.match(/\d+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((v) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }) as [number, number, number]
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const ratio = (lum(bg) + 0.05) / (lum(fg) + 0.05)
    expect(ratio, `${scheme}: ${fg} on ${bg}`).toBeGreaterThan(10)
  }
})
