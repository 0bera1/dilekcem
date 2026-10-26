import { AlignmentType, Document, Packer, Paragraph, TextRun } from 'docx'
import type { Letter } from '../templates/engine'

const FONT = 'Times New Roman'
const SIZE = 24 // half-points: 12 pt

const run = (
  text: string,
  o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {},
): TextRun =>
  new TextRun({
    text,
    font: FONT,
    size: o.size ?? SIZE,
    ...(o.bold ? { bold: true } : {}),
    ...(o.italics ? { italics: true } : {}),
    ...(o.color ? { color: o.color } : {}),
  })

/** Multi-line text becomes one run per line with explicit breaks. */
const lines = (text: string, o: Parameters<typeof run>[1] = {}): TextRun[] =>
  text
    .split('\n')
    .map(
      (l, i) =>
        new TextRun({
          text: l,
          font: FONT,
          size: o?.size ?? SIZE,
          break: i === 0 ? 0 : 1,
          ...(o?.bold ? { bold: true } : {}),
          ...(o?.italics ? { italics: true } : {}),
          ...(o?.color ? { color: o.color } : {}),
        }),
    )

export function buildDocxDocument(letter: Letter): Document {
  const para = (
    children: TextRun[],
    o: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number } = {},
  ): Paragraph =>
    new Paragraph({
      children,
      alignment: o.align ?? AlignmentType.LEFT,
      spacing: { after: o.after ?? 160, line: 320 },
    })

  const children: Paragraph[] = [
    para([run(letter.tarih)], { align: AlignmentType.RIGHT, after: 280 }),
    ...letter.muhatap.map((m, i) =>
      para([run(m, { bold: true })], {
        align: AlignmentType.CENTER,
        after: i === letter.muhatap.length - 1 ? 280 : 0,
      }),
    ),
    para([run('Konu: ', { bold: true }), run(letter.konu)], { after: 240 }),
    ...letter.paragraflar.map((p) => para(lines(p), { align: AlignmentType.JUSTIFIED })),
    para([run(letter.kapanis)], { align: AlignmentType.RIGHT, after: 0 }),
    para([run(letter.imza, { bold: true })], { align: AlignmentType.RIGHT, after: 280 }),
    ...letter.iletisim.map((l) => para([run(l, { size: 20, color: '555555' })], { after: 40 })),
  ]
  if (letter.ekler.length > 0) {
    children.push(para([run('Ekler:', { bold: true, size: 20 })], { after: 40 }))
    letter.ekler.forEach((e, i) =>
      children.push(para([run(`${i + 1}. ${e}`, { size: 20 })], { after: 40 })),
    )
  }
  children.push(
    para([run(`Not: ${letter.uyari}`, { italics: true, size: 18, color: '666666' })], { after: 0 }),
  )

  return new Document({
    creator: 'Dilekçem',
    title: letter.konu,
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 },
          },
        },
        children,
      },
    ],
  })
}

export const createDocxBlob = (letter: Letter): Promise<Blob> =>
  Packer.toBlob(buildDocxDocument(letter))
export const createDocxBuffer = (letter: Letter): Promise<Uint8Array> =>
  Packer.toBuffer(buildDocxDocument(letter))
