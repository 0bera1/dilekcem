import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Workbench } from '../components/Workbench'
import { SITE_URL } from '../lib/site'
import { merciById, resolveTokens } from '../templates/engine'
import { getTemplate } from '../templates'
import NotFound from './NotFound'
import s from './Pages.module.css'

export default function TemplatePage() {
  const { slug = '' } = useParams()
  const def = getTemplate(slug)
  if (!def) return <NotFound />

  const merci = merciById.get(def.where.merciId)
  const faq = def.faq.map((f) => ({ q: f.q, a: resolveTokens(def, f.a) }))
  const path = `/dilekce/${def.slug}`

  return (
    <div className={s.page}>
      <Seo
        title={`${def.title}: hazır örnek`}
        description={def.description}
        path={path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: def.title,
            description: def.description,
            inLanguage: 'tr-TR',
            url: `${SITE_URL}${path}`,
            step: [
              {
                '@type': 'HowToStep',
                name: 'Bilgilerinizi doldurun',
                text: 'Adınızı, adresinizi ve şablona özel alanları yazın.',
              },
              {
                '@type': 'HowToStep',
                name: 'Önizlemeyi kontrol edin',
                text: 'Kâğıt önizlemesindeki metni okuyun, köşeli parantezli alanları tamamlayın.',
              },
              {
                '@type': 'HowToStep',
                name: 'İndirin',
                text: 'Dilekçeyi PDF veya Word olarak indirin, imzalayın.',
              },
              ...(merci
                ? [
                    {
                      '@type': 'HowToStep',
                      name: 'Başvurun',
                      text: `${merci.ad}: ${merci.basvuruYolu}`,
                    },
                  ]
                : []),
            ],
          },
        ]}
      />
      <nav aria-label="Sayfa yolu" className={s.crumbs}>
        <Link to="/">Ana sayfa</Link> <span aria-hidden="true">/</span>{' '}
        <Link to="/dilekce">Şablonlar</Link>
      </nav>
      <h1 className={s.h1}>{def.title}</h1>
      <p className={s.lead}>{def.description}</p>

      <Workbench key={def.slug} def={def} />

      <section className={s.section} aria-labelledby="sss">
        <h2 id="sss" className={s.h2}>
          Sık sorulan sorular
        </h2>
        <div className={s.faq}>
          {faq.map((f) => (
            <details key={f.q} className={s.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {def.related.length > 0 && (
        <section className={s.section} aria-labelledby="ilgili">
          <h2 id="ilgili" className={s.h2}>
            İlgili şablonlar
          </h2>
          <ul className={s.relList}>
            {def.related.map((r) => {
              const rel = getTemplate(r)
              return rel ? (
                <li key={r}>
                  <Link to={`/dilekce/${rel.slug}`}>{rel.title}</Link>
                </li>
              ) : null
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
