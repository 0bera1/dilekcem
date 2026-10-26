// After the static build:
//  1. pin the CSP: move the meta tag to the top of <head> and allow the framework's two inline
//     bootstrap scripts by SHA-256 hash (no 'unsafe-inline');
//  2. expose the pre-rendered not-found page as 404.html (GitHub Pages serves it for unknown paths);
//  3. write sitemap.xml from the pages that were actually emitted.
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIST = 'dist'
const SITE = 'https://dilekcem.beraekimci.com.tr'

/** @param {string} dir @returns {string[]} */
function htmlFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full))
    else if (name.endsWith('.html')) out.push(full)
  }
  return out
}

const CSP_META = /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/

function pinCsp(file) {
  let html = readFileSync(file, 'utf8')
  const match = html.match(CSP_META)
  if (!match) throw new Error(`CSP meta missing in ${file}`)
  const hashes = []
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    hashes.push(
      `'sha256-${createHash('sha256')
        .update(m[1] ?? '', 'utf8')
        .digest('base64')}'`,
    )
  }
  const policy = (match[1] ?? '').replace(
    "script-src 'self'",
    `script-src 'self'${hashes.map((h) => ` ${h}`).join('')}`,
  )
  html = html.replace(CSP_META, '')
  html = html.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`,
  )
  writeFileSync(file, html)
}

for (const file of htmlFiles(DIST)) pinCsp(file)

const notFound = join(DIST, '404', 'index.html')
if (!existsSync(notFound))
  throw new Error('dist/404/index.html missing: the 404 route was not pre-rendered')
copyFileSync(notFound, join(DIST, '404.html'))

const urls = htmlFiles(DIST)
  .map((f) => relative(DIST, f).split(sep).join('/'))
  .filter((f) => f.endsWith('/index.html') || f === 'index.html')
  .map((f) => f.replace(/index\.html$/, '').replace(/\/$/, ''))
  .filter((p) => p !== '404')
  .map((p) => (p === '' ? '/' : `/${p}`))
  .sort()

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.endsWith('/') ? u : `${u}/`}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), xml)
console.log(`postbuild: CSP pinned, 404.html written, sitemap.xml with ${urls.length} URLs`)
