// `npm run check:links` — serves dist/ like GitHub Pages and checks every internal and external link.
import { spawn } from 'node:child_process'
import { LinkChecker } from 'linkinator'

const PORT = '4181'
const server = spawn(process.execPath, ['scripts/serve-dist.mjs'], {
  env: { ...process.env, PORT },
  stdio: 'ignore',
})
await new Promise((r) => setTimeout(r, 1000))

try {
  const checker = new LinkChecker()
  const result = await checker.check({
    path: `http://localhost:${PORT}/`,
    recurse: true,
    timeout: 30_000,
    retry: true,
    // Canonical and Open Graph URLs name the production host, which does not serve this build yet.
    // They are verified after deployment by the smoke and SEO tests.
    linksToSkip: ['https://dilekcem\.beraekimci\.com\.tr'],
  })
  const broken = result.links.filter((l) => l.state === 'BROKEN')
  const external = result.links.filter((l) => !l.url.startsWith(`http://localhost:${PORT}`))
  console.log(`${result.links.length} bağlantı denetlendi (${external.length} dış bağlantı).`)
  if (broken.length > 0) {
    for (const b of broken) console.error(`KIRIK ${b.status ?? ''} ${b.url}  (kaynak: ${b.parent})`)
    process.exitCode = 1
  } else {
    console.log('check:links tamam: kırık bağlantı yok.')
  }
} finally {
  server.kill()
}
