import type { Ctx, Field } from './engine'
import { upperTr } from '../lib/tr'

type Opts = Partial<Pick<Field, 'hint' | 'placeholder' | 'maxLength' | 'options'>> & {
  required?: boolean
  step?: 2 | 3
}

const make =
  (type: Field['type']) =>
  (id: string, label: string, o: Opts = {}): Field => ({
    id,
    label,
    type,
    required: o.required ?? true,
    step: o.step ?? 3,
    ...(o.hint ? { hint: o.hint } : {}),
    ...(o.placeholder ? { placeholder: o.placeholder } : {}),
    ...(o.maxLength ? { maxLength: o.maxLength } : {}),
    ...(o.options ? { options: o.options } : {}),
  })

export const textField = make('text')
export const areaField = (id: string, label: string, o: Opts = {}): Field =>
  make('textarea')(id, label, { maxLength: 2500, ...o })
export const dateField = make('date')
export const numberField = make('number')
export const selectField = (
  id: string,
  label: string,
  options: { value: string; label: string }[],
  o: Opts = {},
): Field => make('select')(id, label, { ...o, options })

/** Uppercase addressee line from a user-entered institution name. */
export const upperName = (c: Ctx, id: string): string => upperTr(c.v(id))

/** Pairs "key: value" lines, skipping empty optional values. */
export const optionalLine = (c: Ctx, id: string, prefix: string): string[] =>
  c.has(id) ? [`${prefix}: ${c.v(id)}`] : []
