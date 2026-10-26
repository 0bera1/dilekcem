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
  const problems = result.links.filter((l) => l.state === 'BROKEN')
  // No response at all (status 0) from an external host is a network problem, not a broken link.
  const unreachable = problems.filter(
    (l) => !l.status && !l.url.startsWith(`http://localhost:${PORT}`),
  )
  const broken = problems.filter((l) => !unreachable.includes(l))
  for (const u of new Set(unreachable.map((l) => l.url))) console.warn(`UYARI yanıt yok (ağ): ${u}`)
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
