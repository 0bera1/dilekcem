const base = require('./lighthouserc.cjs')

module.exports = {
  ci: {
    ...base.ci,
    collect: { ...base.ci.collect, settings: { ...base.ci.collect.settings, preset: 'desktop' } },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/desktop' },
  },
}
