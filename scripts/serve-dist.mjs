// Minimal static server for dist/ that behaves like GitHub Pages:
// directory URLs serve index.html, unknown paths serve 404.html with status 404.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createGzip } from 'node:zlib'
import { extname, join, normalize, resolve } from 'node:path'

const ROOT = resolve('dist')
const PORT = Number(process.env.PORT ?? 4175)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '')
  let file = join(ROOT, clean)
  if (!file.startsWith(ROOT)) return null
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  return existsSync(file) && statSync(file).isFile() ? file : null
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? '/')
  const status = file ? 200 : 404
  const target = file ?? join(ROOT, '404.html')
  const type = TYPES[extname(target)] ?? 'application/octet-stream'
  const compress =
    /text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')
  res.writeHead(status, {
    'content-type': type,
    'cache-control': 'no-store',
    ...(compress ? { 'content-encoding': 'gzip', vary: 'accept-encoding' } : {}),
  })
  const stream = createReadStream(target)
  if (compress) stream.pipe(createGzip()).pipe(res)
  else stream.pipe(res)
}).listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}`))
