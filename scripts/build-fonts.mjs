// Dev-time tool (not part of the build): subsets the self-hosted web fonts to Latin + Turkish so each
// weight is a single small woff2 instead of separate latin / latin-ext files.
//
//   node scripts/build-fonts.mjs <dir with SourceSerif4-{Regular,Semibold,Bold}.ttf and InstrumentSans-{Regular,Medium,SemiBold,Bold}.ttf>
//
// Sources: Source Serif 4 (adobe-fonts/source-serif, SIL OFL), Instrument Sans (Instrument/instrument-sans, SIL OFL).
// The PDF export embeds the full SourceSerif4-{Regular,Bold,It}.ttf files from public/fonts and is unaffected.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import subsetFont from 'subset-font'

const src = process.argv[2]
if (!src) throw new Error('usage: node scripts/build-fonts.mjs <font source dir>')

// Basic Latin, Latin-1, Turkish (Ğ ğ İ ı Ş ş), typographic punctuation, euro, lira, bullet.
const TEXT = [
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x11e, 0x11f],
  [0x130, 0x131],
  [0x15e, 0x15f],
  [0x2013, 0x2014],
  [0x2018, 0x201e],
  [0x2022, 0x2022],
  [0x2026, 0x2026],
  [0x20ac, 0x20ac],
  [0x20ba, 0x20ba],
]
  .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)))
  .join('')

const jobs = [
  ['SourceSerif4-Regular.ttf', 'source-serif-4-400.woff2'],
  ['SourceSerif4-Semibold.ttf', 'source-serif-4-600.woff2'],
  ['SourceSerif4-Bold.ttf', 'source-serif-4-700.woff2'],
  ['InstrumentSans-Regular.ttf', 'instrument-sans-400.woff2'],
  ['InstrumentSans-Medium.ttf', 'instrument-sans-500.woff2'],
  ['InstrumentSans-SemiBold.ttf', 'instrument-sans-600.woff2'],
  ['InstrumentSans-Bold.ttf', 'instrument-sans-700.woff2'],
]

for (const [input, output] of jobs) {
  const out = await subsetFont(readFileSync(join(src, input)), TEXT, { targetFormat: 'woff2' })
  writeFileSync(join('public', 'fonts', output), out)
  console.log(`${output}: ${out.length} bytes`)
}
