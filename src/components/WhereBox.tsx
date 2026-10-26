import { Link } from 'react-router-dom'
import { formatSure, merciById, type TemplateDef } from '../templates/engine'
import type { Deadline } from '../lib/deadline'
import { formatLongDate } from '../lib/dates'
import { Icon } from './Icon'
import s from './Workbench.module.css'

export function VerifiedBadge({ verified, date }: { verified: boolean; date?: string }) {
  return verified ? (
    <span className={`${s.badge} ${s.badgeOk}`}>
      <Icon name="check" size={14} />
      Doğrulandı{date ? `: ${formatLongDate(date) ?? date}` : ''}
    </span>
  ) : (
    <span className={`${s.badge} ${s.badgeWarn}`}>
      <Icon name="alert" size={14} />
      Doğrulanmalı
    </span>
  )
}

function deadlineText(d: Deadline): string {
  if (d.daysLeft > 1) return `${d.daysLeft} gün kaldı`
  if (d.daysLeft === 1) return 'Yarın son gün'
  if (d.daysLeft === 0) return 'Son gün bugün'
  return `Süre ${-d.daysLeft} gün önce doldu`
}

export function WhereBox({ def, deadlines }: { def: TemplateDef; deadlines: Deadline[] }) {
  const merci = merciById.get(def.where.merciId)
  if (!merci) return null
  return (
    <section className={s.where} aria-labelledby={`${def.slug}-where`}>
      <h2 id={`${def.slug}-where`} className={s.whereTitle}>
        Nereye, ne zaman?
      </h2>
      <div className={s.whereHead}>
        <p className={s.whereName}>{merci.ad}</p>
        <VerifiedBadge verified={merci.verified} date={merci.dogrulamaTarihi} />
      </div>
      <p>{merci.basvuruYolu}</p>
      {merci.sureler.length > 0 && (
        <>
          <h3 className={s.whereSub}>Süreler</h3>
          <ul className={s.whereList}>
            {merci.sureler.map((x) => (
              <li key={x.id}>
                <strong>
                  {x.etiket}: {formatSure(x)}.
                </strong>{' '}
                {x.aciklama}
              </li>
            ))}
          </ul>
        </>
      )}
      {merci.parasalSinirlar.length > 0 && (
        <>
          <h3 className={s.whereSub}>Parasal sınır</h3>
          <ul className={s.whereList}>
            {merci.parasalSinirlar.map((x) => (
              <li key={x.id}>
                <strong>
                  {x.etiket}:{' '}
                  {x.tutarTl === null ? 'sınır yok' : `${x.tutarTl.toLocaleString('tr-TR')} TL`}.
                </strong>{' '}
                {x.aciklama}
              </li>
            ))}
          </ul>
        </>
      )}
      {merci.gerekliBelgeler.length > 0 && (
        <>
          <h3 className={s.whereSub}>Hazır bulundurun</h3>
          <ul className={s.whereList}>
            {merci.gerekliBelgeler.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}
      {deadlines.length > 0 && (
        <div className={s.deadlines}>
          {deadlines.map((d) => (
            <p key={d.title} className={d.daysLeft < 0 ? s.deadlineLate : s.deadline}>
              <Icon name="calendar" size={16} />
              <span>
                <strong>{d.title}:</strong> {d.label} ({deadlineText(d)}).
                {d.businessDayNote &&
                  ' İş günü hesabında yalnızca hafta sonları dışarıda bırakılır; resmî tatiller dikkate alınmaz.'}
              </span>
            </p>
          ))}
        </div>
      )}
      {merci.not && <p className={s.whereNote}>{merci.not}</p>}
      <p className={s.whereSource}>
        <a href={merci.kaynakUrl} target="_blank" rel="noopener noreferrer">
          Kaynak
        </a>
        {' · '}
        <Link to="/veri-kaynaklari">Veri kaynakları</Link>
      </p>
    </section>
  )
}
