import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { VerifiedBadge } from '../components/WhereBox'
import { CATEGORIES, type CategoryId } from '../templates/engine'
import { isVerified, searchTemplates } from '../templates'
import s from './Pages.module.css'

type Filter = CategoryId | 'hepsi'

export default function Hub() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<Filter>('hepsi')
  const results = useMemo(() => searchTemplates(query, cat), [query, cat])

  return (
    <div className={s.page}>
      <Seo
        title="Dilekçe şablonları"
        description="Abonelik iptali, ürün iadesi, trafik cezası itirazı, KVKK talebi, istifa ve izin dilekçesi dahil hazır dilekçe örnekleri. Arayın, seçin, doldurun, indirin."
        path="/dilekce"
      />
      <h1 className={s.h1}>Dilekçe şablonları</h1>
      <p className={s.lead}>Bir şablon seçin, sorulara yanıt verin; metin anında hazırlanır.</p>

      <div className={s.filters} role="search">
        <div className={s.searchBox}>
          <label htmlFor="ara" className={s.filterLabel}>
            Şablon ara
          </label>
          <div className={s.searchWrap}>
            <Icon name="search" />
            <input
              id="ara"
              type="search"
              className={s.searchInput}
              placeholder="Örnek: istifa, iade, KVKK"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <label htmlFor="kategori" className={s.filterLabel}>
            Kategori
          </label>
          <select
            id="kategori"
            className={s.select}
            value={cat}
            onChange={(e) => setCat(e.target.value as Filter)}
          >
            <option value="hepsi">Tümü</option>
            {CATEGORIES.filter((c) => c.id !== 'rehber').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" className={s.count}>
        {results.length === 0 ? 'Eşleşen şablon yok.' : `${results.length} şablon listeleniyor.`}
      </p>

      <ul className={s.index}>
        {results.map((t) => (
          <li key={t.slug}>
            <Link to={`/dilekce/${t.slug}`} className={s.indexRow}>
              <span className={s.indexTitle}>{t.title}</span>
              <span className={s.leader} aria-hidden="true" />
              <span className={s.indexMeta}>
                <span className={s.cat}>{CATEGORIES.find((c) => c.id === t.category)?.label}</span>
                <VerifiedBadge verified={isVerified(t)} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
