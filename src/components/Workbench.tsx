import { useEffect, useMemo, useState } from 'react'
import { toIsoDate } from '../lib/dates'
import { computeDeadlines } from '../lib/deadline'
import { downloadBlob, downloadText } from '../lib/download'
import { validateValue } from '../lib/validation'
import {
  MAX_TOTAL_CHARS,
  allFields,
  letterLength,
  letterToText,
  renderLetter,
  type TemplateDef,
  type Values,
} from '../templates/engine'
import { DraftsPanel } from './DraftsPanel'
import { FieldInput } from './FieldInput'
import { Icon } from './Icon'
import { Paper } from './Paper'
import { WhereBox } from './WhereBox'
import s from './Workbench.module.css'

const STEPS: { n: 1 | 2 | 3; title: string }[] = [
  { n: 1, title: 'Adın soyadın' },
  { n: 2, title: 'Kime yazıyorsun?' },
  { n: 3, title: 'Ayrıntılar' },
]

type Busy = 'pdf' | 'docx' | null

export function Workbench({ def }: { def: TemplateDef }) {
  const idPrefix = `f-${def.slug}`
  const [values, setValues] = useState<Values>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attempted, setAttempted] = useState(false)
  const [busy, setBusy] = useState<Busy>(null)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [today, setToday] = useState<Date | null>(null)

  // Date defaults to today after mount so server HTML and first client render match.
  useEffect(() => {
    const now = new Date()
    setToday(now)
    setValues((v) => (v.tarih ? v : { ...v, tarih: toIsoDate(now) }))
  }, [])

  const fields = useMemo(() => allFields(def), [def])
  const errors = useMemo(() => {
    const out: Record<string, string | null> = {}
    for (const f of fields)
      out[f.id] = validateValue(f.type, values[f.id] ?? '', f.required, f.maxLength)
    return out
  }, [fields, values])

  const letter = useMemo(() => renderLetter(def, values), [def, values])
  const deadlines = useMemo(
    () => (today ? computeDeadlines(def, values, today) : []),
    [def, values, today],
  )
  const tooLong = letterLength(letter) > MAX_TOTAL_CHARS

  const setValue = (id: string, v: string): void => {
    setValues((prev) => ({ ...prev, [id]: v }))
    setNotice(null)
  }

  /** Blocks export while required fields are missing or the text is too long. */
  const guard = (): boolean => {
    const bad = fields.find((f) => errors[f.id])
    if (bad) {
      setAttempted(true)
      setNotice({
        kind: 'error',
        text: 'Önce işaretli alanları düzeltin: zorunlu alanlar boş veya hatalı.',
      })
      document.getElementById(`${idPrefix}-${bad.id}`)?.focus()
      return false
    }
    if (tooLong) {
      setNotice({
        kind: 'error',
        text: `Metin çok uzun (en fazla ${MAX_TOTAL_CHARS.toLocaleString('tr-TR')} karakter). Açıklamaları kısaltın.`,
      })
      return false
    }
    return true
  }

  const fileBase = def.slug

  const exportPdf = async (): Promise<void> => {
    if (!guard()) return
    setBusy('pdf')
    try {
      const { createPdfBlob } = await import('../export/pdf')
      downloadBlob(await createPdfBlob(letter), `${fileBase}.pdf`)
      setNotice({ kind: 'ok', text: 'PDF indirildi.' })
    } catch {
      setNotice({
        kind: 'error',
        text: 'PDF oluşturulamadı. Sayfayı yenileyip tekrar deneyin; olmazsa Word veya düz metin olarak indirebilirsiniz.',
      })
    } finally {
      setBusy(null)
    }
  }

  const exportDocx = async (): Promise<void> => {
    if (!guard()) return
    setBusy('docx')
    try {
      const { createDocxBlob } = await import('../export/docx')
      downloadBlob(await createDocxBlob(letter), `${fileBase}.docx`)
      setNotice({ kind: 'ok', text: 'Word belgesi indirildi.' })
    } catch {
      setNotice({
        kind: 'error',
        text: 'Word belgesi oluşturulamadı. PDF veya düz metin olarak indirmeyi deneyin.',
      })
    } finally {
      setBusy(null)
    }
  }

  const copyText = async (): Promise<void> => {
    if (!guard()) return
    try {
      await navigator.clipboard.writeText(letterToText(letter))
      setNotice({ kind: 'ok', text: 'Metin panoya kopyalandı.' })
    } catch {
      downloadText(letterToText(letter), `${fileBase}.txt`)
      setNotice({ kind: 'ok', text: 'Panoya erişilemedi; metin .txt dosyası olarak indirildi.' })
    }
  }

  const print = (): void => {
    if (guard()) window.print()
  }

  const downloadIcs = async (i: number): Promise<void> => {
    const d = deadlines[i]
    if (!d) return
    try {
      const { createIcsBlob } = await import('../export/ics')
      downloadBlob(createIcsBlob(d, def.title), `${fileBase}-hatirlatici.ics`)
      setNotice({ kind: 'ok', text: 'Hatırlatıcı indirildi. Takvim uygulamanızda açın.' })
    } catch {
      setNotice({ kind: 'error', text: 'Hatırlatıcı oluşturulamadı.' })
    }
  }

  return (
    <div className={s.workbench}>
      <section className={s.formCol} aria-labelledby={`${idPrefix}-form`}>
        <h2 id={`${idPrefix}-form`} className="visually-hidden">
          Dilekçe bilgileri
        </h2>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void exportPdf()
          }}
        >
          <ol className={s.steps}>
            {STEPS.map((step) => {
              const list = fields.filter((f) => f.step === step.n)
              if (list.length === 0) return null
              return (
                <li key={step.n} className={s.step}>
                  <fieldset className={s.fieldset}>
                    <legend className={s.legend}>
                      <span className={s.num} aria-hidden="true">
                        {step.n}
                      </span>
                      <span>
                        <span className="visually-hidden">Adım {step.n}: </span>
                        {step.title}
                      </span>
                    </legend>
                    {list.map((f) => (
                      <FieldInput
                        key={f.id}
                        field={f}
                        idPrefix={idPrefix}
                        value={values[f.id] ?? ''}
                        error={attempted || touched[f.id] ? (errors[f.id] ?? null) : null}
                        onChange={(v) => setValue(f.id, v)}
                        onBlur={() => setTouched((t) => ({ ...t, [f.id]: true }))}
                      />
                    ))}
                  </fieldset>
                </li>
              )
            })}
          </ol>

          <WhereBox def={def} deadlines={deadlines} />

          <div className={s.actions}>
            <button type="submit" className={s.btnPrimary} disabled={busy !== null}>
              <Icon name="download" />
              {busy === 'pdf' ? 'PDF hazırlanıyor…' : 'PDF olarak indir'}
            </button>
            <div className={s.row}>
              <button
                type="button"
                className={s.btnSecondary}
                onClick={() => void exportDocx()}
                disabled={busy !== null}
              >
                <Icon name="file" />
                {busy === 'docx' ? 'Hazırlanıyor…' : 'Word (.docx)'}
              </button>
              <button type="button" className={s.btnSecondary} onClick={() => void copyText()}>
                <Icon name="copy" /> Metni kopyala
              </button>
              <button type="button" className={s.btnSecondary} onClick={print}>
                <Icon name="print" /> Yazdır
              </button>
              {deadlines.map((d, i) => (
                <button
                  key={d.title}
                  type="button"
                  className={s.btnSecondary}
                  onClick={() => void downloadIcs(i)}
                >
                  <Icon name="calendar" /> Hatırlatıcı (.ics)
                </button>
              ))}
            </div>
            <p
              role={notice?.kind === 'error' ? 'alert' : 'status'}
              className={notice?.kind === 'error' ? s.noticeError : s.notice}
            >
              {notice?.text ?? ''}
            </p>
          </div>
        </form>
        <DraftsPanel
          def={def}
          values={values}
          onLoad={(v) => {
            setValues({ ...v, tarih: v.tarih ?? values.tarih ?? '' })
            setNotice({ kind: 'ok', text: 'Taslak yüklendi.' })
          }}
        />
      </section>

      <section className={s.deskCol} aria-label="Önizleme">
        <div className={s.desk}>
          <Paper letter={letter} />
        </div>
      </section>
    </div>
  )
}
