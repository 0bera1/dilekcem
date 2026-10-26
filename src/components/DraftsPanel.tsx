import { useEffect, useRef, useState } from 'react'
import {
  clearDrafts,
  draftsEnabled,
  exportDrafts,
  loadDrafts,
  makeDraft,
  mergeDrafts,
  parseImport,
  setDraftsEnabled,
  storeDrafts,
  type Draft,
} from '../lib/drafts'
import { downloadText } from '../lib/download'
import type { TemplateDef, Values } from '../templates/engine'
import { Icon } from './Icon'
import s from './Workbench.module.css'

interface Props {
  def: TemplateDef
  values: Values
  onLoad: (values: Values) => void
}

export function DraftsPanel({ def, values, onLoad }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const on = draftsEnabled()
    setEnabled(on)
    if (on) setDrafts(loadDrafts())
  }, [])

  const toggle = (on: boolean): void => {
    setEnabled(on)
    setDraftsEnabled(on)
    setDrafts(on ? loadDrafts() : [])
    setMessage(
      on
        ? 'Taslak saklama açıldı.'
        : 'Taslak saklama kapatıldı. Kayıtlı taslaklar silinmedi; silmek için "Tümünü sil"i kullanın.',
    )
  }

  const save = (): void => {
    const now = new Date()
    const draft = makeDraft(def, values, now, `${def.slug}-${now.getTime()}`)
    const next = mergeDrafts(drafts, [draft])
    storeDrafts(next)
    setDrafts(next)
    setMessage('Taslak bu cihazda kaydedildi (T.C. kimlik numarası kaydedilmez).')
  }

  const remove = (id: string): void => {
    const next = drafts.filter((d) => d.id !== id)
    storeDrafts(next)
    setDrafts(next)
    setMessage('Taslak silindi.')
  }

  const removeAll = (): void => {
    clearDrafts()
    setDrafts([])
    setMessage('Tüm taslaklar silindi.')
  }

  const onImport = async (file: File | undefined): Promise<void> => {
    if (!file) return
    const result = parseImport(await file.text())
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const next = mergeDrafts(drafts, result.drafts)
    storeDrafts(next)
    setDrafts(next)
    setMessage(`${result.drafts.length} taslak içe aktarıldı.`)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <details className={s.drafts}>
      <summary>Taslaklarım</summary>
      <div className={s.draftsBody}>
        <label className={s.check}>
          <input type="checkbox" checked={enabled} onChange={(e) => toggle(e.target.checked)} />
          <span>Taslak saklamayı aç</span>
        </label>
        <p className={s.hint}>
          Kapalıyken hiçbir şey saklanmaz. Açıkken taslaklar yalnızca bu tarayıcının belleğinde
          (localStorage) tutulur, hiçbir yere gönderilmez. Paylaşılan bir bilgisayardaysanız
          açmayın.
        </p>
        {enabled && (
          <>
            <div className={s.row}>
              <button type="button" className={s.btnSecondary} onClick={save}>
                <Icon name="check" /> Bu taslağı kaydet
              </button>
              <button
                type="button"
                className={s.btnSecondary}
                onClick={() =>
                  downloadText(exportDrafts(drafts), 'dilekcem-taslaklar.json', 'application/json')
                }
                disabled={drafts.length === 0}
              >
                <Icon name="download" /> Dışa aktar (JSON)
              </button>
              <label className={s.btnSecondary}>
                <Icon name="upload" /> İçe aktar
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="visually-hidden"
                  onChange={(e) => void onImport(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                className={s.btnSecondary}
                onClick={removeAll}
                disabled={drafts.length === 0}
              >
                <Icon name="trash" /> Tümünü sil
              </button>
            </div>
            {drafts.length === 0 ? (
              <p className={s.hint}>Kayıtlı taslak yok.</p>
            ) : (
              <ul className={s.draftList}>
                {drafts.map((d) => (
                  <li key={d.id}>
                    <span>
                      <strong>{d.title}</strong>
                      <br />
                      <small>{new Date(d.savedAt).toLocaleString('tr-TR')}</small>
                    </span>
                    <span className={s.row}>
                      {d.slug === def.slug && (
                        <button
                          type="button"
                          className={s.btnSecondary}
                          onClick={() => onLoad(d.values)}
                        >
                          Yükle
                        </button>
                      )}
                      <button
                        type="button"
                        className={s.btnSecondary}
                        onClick={() => remove(d.id)}
                        aria-label={`${d.title} taslağını sil`}
                      >
                        <Icon name="trash" /> Sil
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <p role="status" className={s.status}>
          {message}
        </p>
      </div>
    </details>
  )
}
