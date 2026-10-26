import { ALL_PATHS, SAMPLE, expect, fillAbonelik, test } from './fixtures'

/**
 * Network privacy: the site may only talk to its own origin (fonts and scripts included),
 * and no request may carry anything the user typed.
 */
test('no third-party requests and no user input ever leaves the page', async ({
  page,
  baseURL,
  context,
}) => {
  const origin = new URL(baseURL ?? 'http://localhost:4173').origin
  const seen: { url: string; method: string; body: string | null }[] = []
  page.on('request', (req) =>
    seen.push({ url: req.url(), method: req.method(), body: req.postData() }),
  )

  for (const p of ALL_PATHS) await page.goto(p)
  await page.goto('/dilekce/abonelik-iptali')
  await fillAbonelik(page)
  await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'PDF olarak indir' }).click(),
  ])
  await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Word/ }).click(),
  ])
  await page.getByRole('button', { name: 'Metni kopyala' }).click()
  await page.getByRole('button', { name: /Koyu tema/ }).click()
  await page.getByText('Taslaklarım').click()
  await page.getByLabel('Taslak saklamayı aç').check()
  await page.getByRole('button', { name: /Bu taslağı kaydet/ }).click()
  await page.waitForLoadState('networkidle')

  const external = seen.filter(
    (r) => !r.url.startsWith(origin) && !r.url.startsWith('blob:') && !r.url.startsWith('data:'),
  )
  expect(external, 'requests to other origins').toEqual([])

  const needles = [
    SAMPLE.adSoyad,
    SAMPLE.tckn,
    SAMPLE.telefon,
    SAMPLE.eposta,
    'Ankara',
    encodeURIComponent(SAMPLE.adSoyad),
    'Sabit internet',
  ]
  for (const r of seen) {
    expect(['GET', 'HEAD'], `${r.method} ${r.url}`).toContain(r.method)
    expect(r.body, r.url).toBeNull()
    for (const n of needles)
      expect(decodeURIComponent(r.url), `${r.url} leaks "${n}"`).not.toContain(n)
  }

  // Fonts really come from this origin.
  const fonts = seen.filter((r) => /\.(woff2|ttf)(\?|$)/.test(r.url))
  expect(fonts.length).toBeGreaterThan(0)
  for (const f of fonts) expect(f.url.startsWith(origin)).toBe(true)

  // No cookies at all.
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(() => document.cookie)).toBe('')
})

test('every page ships a strict CSP and no third-party tags', async ({ page }) => {
  for (const p of ALL_PATHS) {
    await page.goto(p)
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content')
    expect(csp, p).toContain("default-src 'self'")
    expect(csp, p).toContain("connect-src 'self'")
    expect(csp, p).not.toContain('unsafe-inline')
    expect(csp, p).not.toContain('unsafe-eval')
    expect(csp, p).not.toMatch(/https?:\/\//)
    const externalSrc = await page.$$eval('script[src], link[href], img[src], iframe', (els) =>
      els
        .map((e) => e.getAttribute('src') ?? e.getAttribute('href') ?? '')
        .filter((u) => /^(https?:)?\/\//.test(u) && !u.startsWith(location.origin)),
    )
    // Canonical and Open Graph URLs are metadata, not requests; script/stylesheet/font sources must be local.
    expect(
      externalSrc.filter((u) => !u.includes('dilekcem.beraekimci.com.tr')),
      p,
    ).toEqual([])
  }
})
