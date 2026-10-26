import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { Letter } from '../templates/engine'

export interface PdfFonts {
  regular: Uint8Array
  bold: Uint8Array
  italic: Uint8Array
}

export const A4: [number, number] = [595.28, 841.89]
const MARGIN_X = 64
const MARGIN_TOP = 70
const MARGIN_BOTTOM = 84
const SIZE = 11
const LEADING = 16.5
const SMALL = 9.5
const INK = rgb(0.1, 0.1, 0.12)
const MUTED = rgb(0.38, 0.38, 0.42)

type Align = 'left' | 'center' | 'right'

/** Replaces characters the font cannot draw so embedding never throws. */
function makeSanitizer(font: PDFFont): (s: string) => string {
  const set = new Set(font.getCharacterSet())
  return (s) =>
    Array.from(s.replace(/\t/g, ' '))
      .map((ch) => (ch === '\n' || set.has(ch.codePointAt(0) ?? 0) ? ch : '?'))
      .join('')
}

function wrapLine(
  text: string,
  font: PDFFont,
  size: number,
  widths: (i: number) => number,
): string[] {
  const lines: string[] = []
  let current = ''
  const limit = (): number => widths(lines.length)
  const fits = (s: string): boolean => font.widthOfTextAtSize(s, size) <= limit()
  for (const word of text.split(/ +/)) {
    if (word === '') continue
    const candidate = current === '' ? word : `${current} ${word}`
    if (fits(candidate)) {
      current = candidate
      continue
    }
    if (current !== '') {
      lines.push(current)
      current = ''
    }
    if (fits(word)) {
      current = word
      continue
    }
    // Very long token: break by characters.
    let chunk = ''
    for (const ch of Array.from(word)) {
      if (fits(chunk + ch)) chunk += ch
      else {
        lines.push(chunk)
        chunk = ch
      }
    }
    current = chunk
  }
  if (current !== '' || lines.length === 0) lines.push(current)
  return lines
}

export async function buildPdf(letter: Letter, fonts: PdfFonts): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const regular = await doc.embedFont(fonts.regular, { subset: true })
  const bold = await doc.embedFont(fonts.bold, { subset: true })
  const italic = await doc.embedFont(fonts.italic, { subset: true })
  const clean = makeSanitizer(regular)
  const cleanBold = makeSanitizer(bold)
  const cleanItalic = makeSanitizer(italic)

  doc.setTitle(letter.konu)
  doc.setCreator('Dilekçem')
  doc.setProducer('Dilekçem')
  doc.setLanguage('tr-TR')

  const contentWidth = A4[0] - MARGIN_X * 2
  const pages: PDFPage[] = []
  let page = doc.addPage(A4)
  pages.push(page)
  let y = A4[1] - MARGIN_TOP

  const newPage = (): void => {
    page = doc.addPage(A4)
    pages.push(page)
    y = A4[1] - MARGIN_TOP
  }
  const ensure = (height: number): void => {
    if (y - height < MARGIN_BOTTOM) newPage()
  }

  const drawText = (
    text: string,
    opts: {
      font?: PDFFont
      size?: number
      align?: Align
      leading?: number
      indentFirst?: number
      color?: ReturnType<typeof rgb>
    } = {},
  ): void => {
    const font = opts.font ?? regular
    const san = font === bold ? cleanBold : font === italic ? cleanItalic : clean
    const size = opts.size ?? SIZE
    const leading = opts.leading ?? LEADING
    const indentFirst = opts.indentFirst ?? 0
    const align = opts.align ?? 'left'
    for (const raw of san(text).split('\n')) {
      const lines = wrapLine(raw, font, size, (i) => contentWidth - (i === 0 ? indentFirst : 0))
      for (const [i, line] of lines.entries()) {
        ensure(leading)
        y -= leading
        const w = font.widthOfTextAtSize(line, size)
        const offset = i === 0 ? indentFirst : 0
        const x =
          align === 'right'
            ? MARGIN_X + contentWidth - w
            : align === 'center'
              ? MARGIN_X + (contentWidth - w) / 2
              : MARGIN_X + offset
        page.drawText(line, {
          x,
          y: y + (leading - size) / 2.4,
          size,
          font,
          color: opts.color ?? INK,
        })
      }
    }
  }
  const gap = (h: number): void => {
    y -= h
  }

  // Date, addressee, subject.
  drawText(letter.tarih, { align: 'right' })
  gap(18)
  for (const line of letter.muhatap) drawText(line, { font: bold, align: 'center' })
  gap(16)
  const label = 'Konu: '
  const labelW = bold.widthOfTextAtSize(label, SIZE)
  ensure(LEADING)
  page.drawText(label, {
    x: MARGIN_X,
    y: y - LEADING + (LEADING - SIZE) / 2.4,
    size: SIZE,
    font: bold,
    color: INK,
  })
  drawText(letter.konu, { indentFirst: labelW })
  gap(12)

  // Body.
  for (const p of letter.paragraflar) {
    drawText(p)
    gap(8)
  }

  // Closing block stays together.
  gap(8)
  ensure(LEADING * 3 + 24)
  drawText(letter.kapanis, { align: 'right' })
  drawText(letter.imza, { align: 'right', font: bold })
  gap(14)

  for (const line of letter.iletisim) drawText(line, { size: SMALL, leading: 13.5, color: MUTED })

  if (letter.ekler.length > 0) {
    gap(10)
    drawText('Ekler:', { font: bold, size: SMALL, leading: 13.5 })
    letter.ekler.forEach((e, i) => drawText(`${i + 1}. ${e}`, { size: SMALL, leading: 13.5 }))
  }

  // Footer on every page: disclaimer and page number.
  const total = pages.length
  const note = cleanItalic(letter.uyari)
  pages.forEach((pg, i) => {
    pg.drawLine({
      start: { x: MARGIN_X, y: 58 },
      end: { x: A4[0] - MARGIN_X, y: 58 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.82),
    })
    pg.drawText(note, {
      x: MARGIN_X,
      y: 44,
      size: 8,
      font: italic,
      color: MUTED,
      maxWidth: contentWidth - 60,
    })
    const num = `Sayfa ${i + 1} / ${total}`
    const w = regular.widthOfTextAtSize(num, 8)
    pg.drawText(num, { x: A4[0] - MARGIN_X - w, y: 44, size: 8, font: regular, color: MUTED })
  })

  return doc.save()
}

const FONT_URLS = {
  regular: '/fonts/SourceSerif4-Regular.ttf',
  bold: '/fonts/SourceSerif4-Bold.ttf',
  italic: '/fonts/SourceSerif4-It.ttf',
}

let fontCache: Promise<PdfFonts> | null = null

/** Loads the self-hosted PDF fonts once (same-origin requests only). */
export function loadPdfFonts(): Promise<PdfFonts> {
  if (!fontCache) {
    const get = async (url: string): Promise<Uint8Array> => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Font yüklenemedi: ${url}`)
      return new Uint8Array(await res.arrayBuffer())
    }
    fontCache = Promise.all([get(FONT_URLS.regular), get(FONT_URLS.bold), get(FONT_URLS.italic)])
      .then(([regular, bold, italic]) => ({ regular, bold, italic }))
      .catch((e: unknown) => {
        fontCache = null
        throw e
      })
  }
  return fontCache
}

export async function createPdfBlob(letter: Letter): Promise<Blob> {
  const bytes = await buildPdf(letter, await loadPdfFonts())
  return new Blob([bytes as BlobPart], { type: 'application/pdf' })
}
