import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTemplate, kararAgaci } from '../templates'
import { merciById } from '../templates/engine'
import { Icon } from './Icon'
import { VerifiedBadge } from './WhereBox'
import s from './DecisionFinder.module.css'

const nodes = new Map(kararAgaci.dugumler.map((n) => [n.id, n]))

/** Walks the JSON decision tree and ends on a template. */
export function DecisionFinder() {
  const [trail, setTrail] = useState<{ nodeId: string; choice: string }[]>([])
  const [result, setResult] = useState<string | null>(null)

  const nodeId = result ? null : nodeIdAfter(trail)
  const node = nodeId ? nodes.get(nodeId) : undefined

  const choose = (opt: {
    etiket: string
    git?: string | undefined
    sonuc?: string | undefined
  }): void => {
    const from = nodeId ?? kararAgaci.baslangic
    setTrail((t) => [...t, { nodeId: from, choice: opt.etiket }])
    if (opt.sonuc) setResult(opt.sonuc)
  }

  const back = (): void => {
    setResult(null)
    setTrail((t) => t.slice(0, -1))
  }
  const restart = (): void => {
    setResult(null)
    setTrail([])
  }

  const tpl = result ? getTemplate(result) : undefined
  const merci = tpl ? merciById.get(tpl.where.merciId) : undefined

  return (
    <div className={s.finder}>
      {trail.length > 0 && (
        <ol className={s.trail} aria-label="Seçimleriniz">
          {trail.map((t, i) => (
            <li key={`${t.nodeId}-${i}`}>{t.choice}</li>
          ))}
        </ol>
      )}

      {node && (
        <div>
          <h2 className={s.q} id="karar-soru">
            {node.soru}
          </h2>
          {node.yardim && <p className={s.help}>{node.yardim}</p>}
          <ul className={s.options} aria-labelledby="karar-soru">
            {node.secenekler.map((o) => (
              <li key={o.etiket}>
                <button type="button" className={s.option} onClick={() => choose(o)}>
                  <span>{o.etiket}</span>
                  <Icon name="arrow" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tpl && (
        <div className={s.result} role="status">
          <h2 className={s.q}>Size uygun şablon</h2>
          <p className={s.resultTitle}>{tpl.title}</p>
          <p>{tpl.description}</p>
          {merci && (
            <p className={s.resultWhere}>
              <strong>Başvuru yeri:</strong> {merci.ad} <VerifiedBadge verified={merci.verified} />
            </p>
          )}
          <Link to={`/dilekce/${tpl.slug}`} className={s.cta}>
            Dilekçeyi hazırla <Icon name="arrow" />
          </Link>
        </div>
      )}

      <div className={s.nav}>
        {trail.length > 0 && (
          <button type="button" className={s.ghost} onClick={back}>
            Geri
          </button>
        )}
        {trail.length > 0 && (
          <button type="button" className={s.ghost} onClick={restart}>
            Baştan başla
          </button>
        )}
      </div>
    </div>
  )
}

/** The node reached after following `trail` from the start, or null when the trail ended on a result. */
function nodeIdAfter(trail: { nodeId: string; choice: string }[]): string | null {
  let id: string | null = kararAgaci.baslangic as string | null
  for (const step of trail) {
    const opt: { git?: string | undefined } | undefined = nodes
      .get(id ?? '')
      ?.secenekler.find((o) => o.etiket === step.choice)
    id = opt?.git ?? null
    if (!id) return null
  }
  return id
}
