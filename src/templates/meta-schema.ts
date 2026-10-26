import { z } from 'zod'

export const fieldSchema = z.object({
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'email', 'tel', 'date', 'tckn', 'number', 'select']),
  required: z.boolean(),
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  hint: z.string().optional(),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
})

/** Validates the data part of a definition (functions are checked by tests). */
export const templateMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(3),
  category: z.enum(['tuketici', 'kamu', 'kisisel-veri', 'is-okul']),
  description: z.string().min(20).max(300),
  fields: z.array(fieldSchema).min(1),
  where: z.object({ merciId: z.string().min(1) }),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(10) })).min(2),
  related: z.array(z.string()),
  reminders: z
    .array(z.object({ fromField: z.string(), sureId: z.string(), title: z.string() }))
    .optional(),
})
