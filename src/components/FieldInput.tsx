import type { Field } from '../templates/engine'
import s from './Workbench.module.css'

interface Props {
  field: Field
  idPrefix: string
  value: string
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
}

const AUTOCOMPLETE: Record<string, string> = {
  adSoyad: 'name',
  adres: 'street-address',
  telefon: 'tel',
  eposta: 'email',
}

export function FieldInput({ field, idPrefix, value, error, onChange, onBlur }: Props) {
  const id = `${idPrefix}-${field.id}`
  const hintId = field.hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name: field.id,
    value,
    required: field.required,
    'aria-required': field.required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    autoComplete: AUTOCOMPLETE[field.id] ?? 'off',
    onBlur,
    className: s.input,
  }
  const set = (e: { target: { value: string } }): void => onChange(e.target.value)

  let control
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          {...common}
          rows={field.maxLength && field.maxLength <= 400 ? 3 : 5}
          maxLength={field.maxLength ?? 2500}
          placeholder={field.placeholder}
          onChange={set}
        />
      )
      break
    case 'select':
      control = (
        <select {...common} onChange={set}>
          <option value="">Seçin</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.charAt(0).toLocaleUpperCase('tr-TR') + o.label.slice(1)}
            </option>
          ))}
        </select>
      )
      break
    case 'date':
      control = <input {...common} type="date" onChange={set} />
      break
    case 'tel':
      control = (
        <input
          {...common}
          type="tel"
          inputMode="tel"
          maxLength={20}
          placeholder={field.placeholder}
          onChange={set}
        />
      )
      break
    case 'email':
      control = (
        <input
          {...common}
          type="email"
          inputMode="email"
          maxLength={120}
          placeholder={field.placeholder}
          onChange={set}
        />
      )
      break
    case 'tckn':
      control = (
        <input
          {...common}
          type="text"
          inputMode="numeric"
          maxLength={11}
          placeholder="11 haneli"
          onChange={set}
        />
      )
      break
    case 'number':
      control = (
        <input
          {...common}
          type="text"
          inputMode="decimal"
          maxLength={12}
          placeholder={field.placeholder}
          onChange={set}
        />
      )
      break
    default:
      control = (
        <input
          {...common}
          type="text"
          maxLength={field.maxLength ?? 200}
          placeholder={field.placeholder}
          onChange={set}
        />
      )
  }

  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {field.label}
        {!field.required && <span className={s.optional}> (isteğe bağlı)</span>}
      </label>
      {hintId && (
        <p id={hintId} className={s.hint}>
          {field.hint}
        </p>
      )}
      {control}
      {errId && (
        <p id={errId} className={s.error}>
          {error}
        </p>
      )}
    </div>
  )
}
