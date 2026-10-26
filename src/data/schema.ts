import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const url = z.string().url()

export const sureSchema = z.object({
  id: z.string().min(1),
  etiket: z.string().min(1),
  deger: z.number().int().positive(),
  birim: z.enum(['gun', 'is-gunu', 'ay', 'yil']),
  aciklama: z.string().min(1),
})

export const parasalSinirSchema = z.object({
  id: z.string().min(1),
  etiket: z.string().min(1),
  tutarTl: z.number().nonnegative().nullable(),
  aciklama: z.string().min(1),
})

export const merciSchema = z.object({
  id: z.string().min(1),
  ad: z.string().min(1),
  tur: z.enum(['kurum', 'mahkeme', 'ozel']),
  basvuruYolu: z.string().min(1),
  web: url.optional(),
  sureler: z.array(sureSchema),
  parasalSinirlar: z.array(parasalSinirSchema),
  gerekliBelgeler: z.array(z.string()),
  kaynakUrl: url,
  dogrulamaTarihi: isoDate,
  verified: z.boolean(),
  validFrom: isoDate,
  validTo: isoDate.nullable(),
  not: z.string().optional(),
})

export const mevzuatSchema = z.object({
  id: z.string().min(1),
  /** Ready-to-use citation phrase, already inflected, e.g. "6502 sayılı Kanun'un 48. maddesi". */
  atif: z.string().min(1),
  ozet: z.string().min(1),
  kaynakUrl: url,
  dogrulamaTarihi: isoDate,
  verified: z.boolean(),
})

export type Merci = z.infer<typeof merciSchema>
export type Sure = z.infer<typeof sureSchema>
export type Mevzuat = z.infer<typeof mevzuatSchema>

export const merciListSchema = z.array(merciSchema).superRefine((list, ctx) => {
  const seen = new Set<string>()
  list.forEach((m, i) => {
    if (seen.has(m.id))
      ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `duplicate merci id ${m.id}` })
    seen.add(m.id)
  })
})
export const mevzuatListSchema = z.array(mevzuatSchema)

export const kararDugumuSchema = z.object({
  id: z.string().min(1),
  soru: z.string().min(1),
  yardim: z.string().optional(),
  secenekler: z
    .array(
      z.object({
        etiket: z.string().min(1),
        /** Next node id. */
        git: z.string().optional(),
        /** Result: a template slug. */
        sonuc: z.string().optional(),
      }),
    )
    .min(2),
})
export const kararAgaciSchema = z.object({
  baslangic: z.string().min(1),
  dugumler: z.array(kararDugumuSchema).min(1),
})
export type KararAgaci = z.infer<typeof kararAgaciSchema>
