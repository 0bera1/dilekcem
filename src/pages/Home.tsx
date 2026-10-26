import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryTabs } from '../components/CategoryTabs'
import { DecisionFinder } from '../components/DecisionFinder'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { Workbench } from '../components/Workbench'
import { SITE_NAME, SITE_URL } from '../lib/site'
import { CATEGORIES, type CategoryId } from '../templates/engine'
import { getTemplate, templatesByCategory } from '../templates'
import s from './Pages.module.css'

type Tab = CategoryId | 'rehber'

export default function Home() {
  const [tab, setTab] = useState<Tab>('tuketici')
  const [slug, setSlug] = useState<string>(templatesByCategory('tuketici')[0]?.slug ?? '')

  const onTab = (id: string): void => {
    const next = id as Tab
    setTab(next)
    if (next !== 'rehber') setSlug(templatesByCategory(next)[0]?.slug ?? '')
  }

  const list = tab === 'rehber' ? [] : templatesByCategory(tab)
  const def = getTemplate(slug)

  return (
    <div className={s.page}>
      <Seo
        title="Hazır dilekçe ve başvuru metinleri"
        description="Sorununuzu seçin, birkaç soruyu yanıtlayın; resmî dille hazırlanmış dilekçeniz anında oluşsun. PDF, Word veya düz metin olarak indirin. Verileriniz cihazınızdan çıkmaz."
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: 'tr-TR',
          },
        ]}
      />
      <section className={s.hero}>
        <h1 className={s.h1}>Sorununu seç, dilekçen hazır olsun</h1>
        <p className={s.lead}>
          Birkaç soruyu yanıtla; resmî dille yazılmış metin sağdaki kâğıtta anında belirsin. Nereye,
          ne zaman ve hangi belgelerle başvuracağını da gör. Yazdıkların cihazından çıkmaz.
        </p>
      </section>

      <CategoryTabs
        tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        value={tab}
        onChange={onTab}
        idPrefix="ana"
        label="Dilekçe kategorileri"
      >
        {tab === 'rehber' ? (
          <div>
            <p className={s.panelLead}>
              Hangi şablonun size uygun olduğundan emin değil misiniz? Birkaç soruya yanıt verin.
            </p>
            <DecisionFinder />
            <p className={s.panelLead}>
              <Link to="/basvuru-yolu">Başvuru yolu bulucuyu ayrı sayfada aç</Link>
            </p>
          </div>
        ) : (
          <>
            <div className={s.pickerRow}>
              <p className={s.pickerLabel} id="sablon-sec">
                Şablon
              </p>
              <ul className={s.picker} aria-labelledby="sablon-sec">
                {list.map((t) => (
                  <li key={t.slug}>
                    <button
                      type="button"
                      className={s.chip}
                      aria-pressed={t.slug === slug}
                      onClick={() => setSlug(t.slug)}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
              {def && (
                <p className={s.pageLink}>
                  <Link to={`/dilekce/${def.slug}`}>
                    Bu şablonun sayfası ve sık sorulan sorular <Icon name="arrow" size={16} />
                  </Link>
                </p>
              )}
            </div>
            {def && <Workbench key={def.slug} def={def} />}
          </>
        )}
      </CategoryTabs>
    </div>
  )
}
