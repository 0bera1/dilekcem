import AxeBuilder from '@axe-core/playwright'
import { ALL_PATHS, expect, fillAbonelik, test } from './fixtures'

const SCHEMES = ['light', 'dark'] as const
const WIDTHS = [390, 1280] as const

test.describe('axe: WCAG 2.2 AA, no critical or serious violations', () => {
  for (const scheme of SCHEMES) {
    for (const width of WIDTHS) {
      test(`all pages, ${scheme}, ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ colorScheme: scheme })
        for (const path of ALL_PATHS) {
          await page.goto(path)
          await page.waitForLoadState('networkidle')
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()
          const bad = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious',
          )
          expect(
            bad.map(
              (v) =>
                `${path}: ${v.id} (${v.impact}) ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
            ),
          ).toEqual([])
        }
      })
    }
  }

  test('form with errors, drafts panel and filled paper are accessible', async ({ page }) => {
    for (const scheme of SCHEMES) {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/dilekce/abonelik-iptali')
      await page.getByRole('button', { name: 'PDF olarak indir' }).click()
      await page.getByText('Taslaklarım').click()
      await page.getByLabel('Taslak saklamayı aç').check()
      let results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
      expect(
        results.violations
          .filter((v) => v.impact === 'critical' || v.impact === 'serious')
          .map((v) => v.id),
      ).toEqual([])
      await fillAbonelik(page)
      results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
      expect(
        results.violations
          .filter((v) => v.impact === 'critical' || v.impact === 'serious')
          .map((v) => v.id),
      ).toEqual([])
    }
  })

  test('interactive targets are at least 44px', async ({ page }) => {
    await page.goto('/')
    const small = await page.$$eval(
      'button, a[href], input:not([type=hidden]), select, textarea, summary',
      (els) =>
        els
          .filter((e) => {
            const r = e.getBoundingClientRect()
            const style = getComputedStyle(e)
            if (r.width === 0 || r.height === 0 || style.visibility === 'hidden') return false
            // inline links inside running text are exempt (WCAG 2.5.8 inline exception)
            if (e.tagName === 'A' && getComputedStyle(e).display === 'inline') return false
            if (e.classList.contains('skip-link')) return false
            // a checkbox is operated through its 44px label
            const label = e.closest('label')
            if (label && label.getBoundingClientRect().height >= 43.5) return false
            return r.height < 43.5 || r.width < 43.5
          })
          .map(
            (e) =>
              `${e.tagName}.${e.className} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`,
          ),
    )
    expect(small).toEqual([])
  })

  test('focus is always visible', async ({ page }) => {
    await page.goto('/')
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      const outline = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return 'none'
        const s = getComputedStyle(el)
        return `${s.outlineStyle} ${s.outlineWidth}`
      })
      expect(outline, `tab stop ${i + 1}`).not.toMatch(/^none|0px$/)
    }
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const d = await page.evaluate(
      () => getComputedStyle(document.querySelector('button')!).transitionDuration,
    )
    expect(parseFloat(d)).toBeLessThan(0.01)
  })

  test('headings are ordered without skipping levels', async ({ page }) => {
    for (const path of ALL_PATHS) {
      await page.goto(path)
      const levels = await page.$$eval('h1, h2, h3, h4', (hs) =>
        hs.map((h) => Number(h.tagName[1])),
      )
      expect(levels[0], path).toBe(1)
      for (let i = 1; i < levels.length; i++)
        expect(levels[i]! - levels[i - 1]!, `${path} ${levels.join('')}`).toBeLessThanOrEqual(1)
    }
  })
})
