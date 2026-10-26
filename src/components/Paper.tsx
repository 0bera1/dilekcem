import { Fragment } from 'react'
import { PLACEHOLDER_RE, UYARI, type Letter } from '../templates/engine'
import s from './Paper.module.css'

/** Wraps "[Placeholder]" segments so they can be highlighted. */
function Marked({ text }: { text: string }) {
  const parts = text.split(PLACEHOLDER_RE)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={s.ph}>
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

export function Paper({ letter }: { letter: Letter }) {
  return (
    <>
      <div className={`${s.paper} paper-sheet`} id="onizleme">
        <span className={s.fold} aria-hidden="true" data-no-print />
        <div
          className={s.content}
          aria-live="polite"
          aria-atomic="false"
          aria-label="Dilekçe önizlemesi"
          role="region"
        >
          <p className={s.date}>
            <Marked text={letter.tarih} />
          </p>
          <div className={s.muhatap}>
            {letter.muhatap.map((m, i) => (
              <p key={i}>
                <Marked text={m} />
              </p>
            ))}
          </div>
          <p className={s.konu}>
            <strong>Konu:</strong> <Marked text={letter.konu} />
          </p>
          {letter.paragraflar.map((p, i) => (
            <p key={i} className={s.para}>
              <Marked text={p} />
            </p>
          ))}
          <div className={s.closing}>
            <p>{letter.kapanis}</p>
            <p className={s.sign}>
              <Marked text={letter.imza} />
            </p>
          </div>
          <div className={s.contact}>
            {letter.iletisim.map((l, i) => (
              <p key={i}>
                <Marked text={l} />
              </p>
            ))}
          </div>
          {letter.ekler.length > 0 && (
            <div className={s.ekler}>
              <p>
                <strong>Ekler:</strong>
              </p>
              <ol>
                {letter.ekler.map((e, i) => (
                  <li key={i}>
                    <Marked text={e} />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <span className={s.stamp} aria-hidden="true" data-no-print>
          TASLAK
        </span>
      </div>
      <p className={s.disclaimer}>{UYARI}</p>
    </>
  )
}
