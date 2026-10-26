// Lighthouse CI: four categories >= 90 on mobile and desktop, home page and one template page.
const urls = ['http://localhost:4175/', 'http://localhost:4175/dilekce/abonelik-iptali']
const assertions = {
  'categories:performance': ['error', { minScore: 0.9 }],
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.9 }],
  'categories:seo': ['error', { minScore: 0.9 }],
}

module.exports = {
  ci: {
    collect: {
      url: process.env.LHCI_URLS ? process.env.LHCI_URLS.split(',') : urls,
      numberOfRuns: 2,
      startServerCommand: process.env.LHCI_URLS ? undefined : 'node scripts/serve-dist.mjs',
      startServerReadyPattern: 'serving dist',
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: { assertions },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
}
