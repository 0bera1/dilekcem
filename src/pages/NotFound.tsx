import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import s from './Pages.module.css'

export default function NotFound() {
  return (
    <div className={s.page}>
      <Seo
        title="Sayfa bulunamadı"
        description="Aradığınız sayfa bulunamadı."
        path="/404"
        noindex
      />
      <h1 className={s.h1}>Sayfa bulunamadı</h1>
      <p className={s.lead}>
        Aradığınız adres yok ya da taşınmış olabilir. Şablonlara göz atabilir veya ana sayfaya
        dönebilirsiniz.
      </p>
      <p className={s.row}>
        <Link to="/" className={s.cta}>
          Ana sayfaya dön
        </Link>
        <Link to="/dilekce" className={s.ctaGhost}>
          Tüm şablonlar
        </Link>
      </p>
    </div>
  )
}
