// `npm run check:secrets`
//  1. scans the working tree and the whole git history for known token shapes (never prints a match);
//  2. runs gitleaks when installed, otherwise secretlint.
import { spawnSync } from 'node:child_process'

const PATTERNS = [
  ['Cloudflare token', /cfut_[A-Za-z0-9]{20,}/],
  ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{20,}/],
  ['GitHub classic token', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
]

let failed = false
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    shell: process.platform === 'win32',
    ...opts,
  })

// Whole history, all branches, with patches. Only the label is reported, never the value.
const history = run('git', ['log', '--all', '-p', '--no-color'])
if (history.status === 0) {
  for (const [label, re] of PATTERNS) {
    if (re.test(history.stdout)) {
      console.error(`SIZINTI: git geçmişinde ${label} biçimi bulundu.`)
      failed = true
    }
  }
  console.log('git geçmişi tarandı.')
} else {
  console.log('git geçmişi yok, yalnızca çalışma ağacı taranıyor.')
}

const tracked = run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
const files = (tracked.stdout ?? '').split('\0').filter(Boolean)
const { readFileSync, existsSync } = await import('node:fs')
for (const f of files) {
  if (!existsSync(f) || /\.(ttf|woff2|png|ico|lock)$/.test(f) || f === 'package-lock.json') continue
  let text
  try {
    text = readFileSync(f, 'utf8')
  } catch {
    continue
  }
  for (const [label, re] of PATTERNS) {
    if (re.test(text)) {
      console.error(`SIZINTI: ${f} içinde ${label} biçimi bulundu.`)
      failed = true
    }
  }
}
console.log(`${files.length} dosya tarandı.`)

const gl = run('gitleaks', ['version'])
if (gl.status === 0) {
  const r = run('gitleaks', ['detect', '--source', '.', '--redact', '--no-banner'], {
    stdio: 'inherit',
  })
  if (r.status !== 0) failed = true
} else {
  console.log('gitleaks kurulu değil, secretlint çalıştırılıyor.')
  const r = run('npx', ['secretlint', '**/*'], { stdio: 'inherit' })
  if (r.status !== 0) failed = true
}

if (failed) process.exit(1)
console.log('check:secrets tamam: sızıntı yok.')
