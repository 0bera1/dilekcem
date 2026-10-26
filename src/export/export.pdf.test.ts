import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { sampleValues } from '../test/samples'
import { UYARI, letterToText, renderLetter } from '../templates/engine'
import { getTemplate, templates } from '../templates'
import { createDocxBuffer } from './docx'
import { buildPdf, type PdfFonts } from './pdf'

const dir = join(process.cwd(), 'public', 'fonts')
const fonts: PdfFonts = {
  regular: new Uint8Array(readFileSync(join(dir, 'SourceSerif4-Regular.ttf'))),
  bold: new Uint8Array(readFileSync(join(dir, 'SourceSerif4-Bold.ttf'))),
  italic: new Uint8Array(readFileSync(join(dir, 'SourceSerif4-It.ttf'))),
}

interface Parsed {
  pages: {
    width: number
    height: number
    text: string
    items: { x: number; y: number; str: string }[]
  }[]
}

async function parse(bytes: Uint8Array): Promise<Parsed> {
  const pdf = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise
  const pages: Parsed['pages'] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const [x0, y0, x1, y1] = page.view as [number, number, number, number]
    const content = await page.getTextContent()
    const items = content.items
      .filter((it): it is Extract<typeof it, { str: string }> => 'str' in it)
      .map((it) => ({ x: it.transform[4] as number, y: it.transform[5] as number, str: it.str }))
    pages.push({
      width: x1 - x0,
      height: y1 - y0,
      text: items.map((it) => it.str).join(' '),
      items,
    })
  }
  return { pages }
}

const squash = (s: string): string => s.replace(/\s+/g, '').normalize('NFC')

describe.each(templates.map((t) => [t.slug, t] as const))('PDF for %s', (_slug, def) => {
  it('is an A4 document with the expected Turkish text and disclaimer', async () => {
    const values = sampleValues(def, { adSoyad: 'Ğüşiöç İıÖÇ Şahin' })
    const letter = renderLetter(def, values)
    const parsed = await parse(await buildPdf(letter, fonts))

    expect(parsed.pages.length).toBeGreaterThanOrEqual(1)
    for (const p of parsed.pages) {
      expect(p.width).toBeCloseTo(595.28, 0)
      expect(p.height).toBeCloseTo(841.89, 0)
    }
    const all = squash(parsed.pages.map((p) => p.text).join(' '))
    // Turkish letters survive embedding and extraction.
    expect(all).toContain(squash('Ğüşiöç İıÖÇ Şahin'))
    expect(all).toContain(squash(letter.konu))
    expect(all).toContain(squash(UYARI))
    for (const ch of 'ğüşiöçİı') expect(all, ch).toContain(ch)
    // No page is empty apart from its footer.
    for (const p of parsed.pages) {
      const body = p.items
        .filter((it) => it.y > 90)
        .map((it) => it.str)
        .join('')
      expect(body.length).toBeGreaterThan(20)
    }
  })
})

describe('PDF layout robustness', () => {
  const def = getTemplate('ayipli-urun')!

  it('flows a very long text onto several pages without leaving the page', async () => {
    const long = Array.from(
      { length: 60 },
      (_, i) => `Paragraf ${i + 1}: ${'Çok uzun bir açıklama cümlesi yazılıyor. '.repeat(12)}`,
    ).join('\n')
    const letter = renderLetter(def, sampleValues(def, { ayip: long }))
    const parsed = await parse(await buildPdf(letter, fonts))
    expect(parsed.pages.length).toBeGreaterThan(2)
    for (const p of parsed.pages) {
      for (const it of p.items) {
        expect(it.x).toBeGreaterThanOrEqual(0)
        expect(it.x).toBeLessThan(p.width - 20)
        expect(it.y).toBeGreaterThan(0)
        expect(it.y).toBeLessThan(p.height)
      }
    }
    const last = parsed.pages.at(-1)!.text
    expect(squash(last)).toContain(squash('Saygılarımla'))
    expect(squash(parsed.pages.map((p) => p.text).join(' '))).toContain(
      `Sayfa${parsed.pages.length}/${parsed.pages.length}`,
    )
  })

  it('breaks an unbroken 400-character token instead of overflowing', async () => {
    const letter = renderLetter(def, sampleValues(def, { ayip: 'x'.repeat(400) }))
    const parsed = await parse(await buildPdf(letter, fonts))
    for (const p of parsed.pages) for (const it of p.items) expect(it.x).toBeLessThan(p.width - 20)
  })

  it('survives characters the font does not contain', async () => {
    const letter = renderLetter(
      def,
      sampleValues(def, { ayip: 'Emoji \u{1F600} ve CJK 中 denemesi' }),
    )
    const bytes = await buildPdf(letter, fonts)
    expect((await parse(bytes)).pages.length).toBeGreaterThan(0)
  })

  it('keeps the plain-text version consistent with the PDF body', async () => {
    const letter = renderLetter(def, sampleValues(def))
    const parsed = await parse(await buildPdf(letter, fonts))
    const pdfText = squash(parsed.pages.map((p) => p.text).join(' '))
    for (const p of letter.paragraflar) expect(pdfText).toContain(squash(p.split('\n')[0] ?? ''))
    expect(letterToText(letter)).toContain(UYARI)
  })
})

describe('DOCX', () => {
  it.each(templates.map((t) => [t.slug, t] as const))(
    '%s produces a valid package with the letter text',
    async (_s, def) => {
      const letter = renderLetter(def, sampleValues(def, { adSoyad: 'Ğüşiöç İıÖÇ Şahin' }))
      const buf = await createDocxBuffer(letter)
      const zip = await JSZip.loadAsync(buf)
      expect(Object.keys(zip.files)).toEqual(
        expect.arrayContaining(['[Content_Types].xml', 'word/document.xml']),
      )
      const xml = await zip.file('word/document.xml')!.async('string')
      const text = xml.replace(/<[^>]+>/g, '')
      expect(text).toContain('Ğüşiöç İıÖÇ Şahin')
      expect(text).toContain(letter.konu)
      expect(text).toContain(UYARI)
      expect(xml).toContain('w:w="11906"')
      expect(xml).toContain('w:h="16838"')
    },
  )
})
