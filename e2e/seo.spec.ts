import { expect, test } from './fixtures'

test('sitemap lists only reachable pages, each with a single h1 and unique title and description', async ({
  page,
  request,
  baseURL,
}) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  expect(urls.length).toBeGreaterThanOrEqual(24)
  expect(new Set(urls).size).toBe(urls.length)

  const titles = new Set<string>()
  const descriptions = new Set<string>()
  for (const u of urls) {
    expect(u.startsWith('https://dilekcem.beraekimci.com.tr')).toBe(true)
    const path = new URL(u).pathname
    const r = await page.goto(path)
    expect(r?.status(), path).toBe(200)
    await expect(page.locator('h1'), path).toHaveCount(1)
    const title = await page.title()
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(title.length, path).toBeGreaterThan(5)
    expect(desc?.length ?? 0, path).toBeGreaterThan(40)
    expect(canonical, path).toBe(u)
    expect(titles.has(title), `duplicate title: ${title}`).toBe(false)
    expect(descriptions.has(desc ?? ''), `duplicate description on ${path}`).toBe(false)
    titles.add(title)
    descriptions.add(desc ?? '')
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
  }
  expect(baseURL).toBeTruthy()
})

test('template pages carry valid FAQPage and HowTo JSON-LD', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const paths = [...xml.matchAll(/<loc>[^<]*?(\/dilekce\/[^<]+)<\/loc>/g)].map((m) => m[1]!)
  expect(paths.length).toBe(18)
  for (const p of paths) {
    await page.goto(p)
    const blocks = await page.$$eval('script[type="application/ld+json"]', (s) =>
      s.map((x) => x.textContent ?? ''),
    )
    expect(blocks.length, p).toBe(2)
    const types = blocks.map((b) => (JSON.parse(b) as { '@type': string })['@type']).sort()
    expect(types, p).toEqual(['FAQPage', 'HowTo'])
    const faq = JSON.parse(blocks.find((b) => b.includes('FAQPage'))!) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[]
    }
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(2)
    for (const q of faq.mainEntity) expect(q.acceptedAnswer.text, p).not.toMatch(/\{\{/)
  }
})

test('robots.txt points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)
  expect(await res.text()).toContain('Sitemap: https://dilekcem.beraekimci.com.tr/sitemap.xml')
})

test('CNAME and 404 page are published', async ({ request }) => {
  const cname = await request.get('/CNAME')
  expect(cname.status()).toBe(200)
  expect((await cname.text()).trim()).toBe('dilekcem.beraekimci.com.tr')
  const nf = await request.get('/gecersiz-adres')
  expect(nf.status()).toBe(404)
  expect(await nf.text()).toContain('Sayfa bulunamadı')
})

test('internal links on every page resolve', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const paths = [...xml.matchAll(/<loc>https:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/')
  const links = new Set<string>()
  for (const p of paths) {
    await page.goto(p)
    for (const href of await page.$$eval('a[href^="/"]', (as) =>
      as.map((a) => a.getAttribute('href')!),
    ))
      links.add(href.split('#')[0]!)
  }
  for (const href of links) {
    const r = await request.get(href || '/')
    expect(r.status(), href).toBe(200)
  }
})
