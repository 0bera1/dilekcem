import { Link, NavLink, Outlet } from 'react-router-dom'
import { TAGLINE } from '../lib/site'
import { useTheme } from '../lib/theme'
import { Icon } from './Icon'
import s from './Layout.module.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      className={s.themeBtn}
      onClick={toggle}
      aria-pressed={theme === null ? undefined : theme === 'dark'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      <span className={s.themeText}>Koyu tema</span>
    </button>
  )
}

function Brand() {
  return (
    <Link to="/" className={s.brand}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <path
          d="M18 12h20l10 10v30a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z"
          fill="#fffdf7"
        />
        <path d="M38 12v10h10" fill="#d8d2c2" />
        <path
          d="M23 30h18M23 37h18M23 44h11"
          stroke="#12182b"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span className={s.brandText}>
        <span className={s.brandName}>Dilekçem</span>
        <span className={s.brandSub}>{TAGLINE}</span>
      </span>
    </Link>
  )
}

export function Layout() {
  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe atla
      </a>
      <header className={s.header}>
        <div className={s.bar}>
          <Brand />
          <nav className={s.nav} aria-label="Ana gezinme">
            <NavLink to="/dilekce">Şablonlar</NavLink>
            <NavLink to="/basvuru-yolu">Başvuru yolu</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="icerik" tabIndex={-1} className={s.main}>
        <Outlet />
      </main>
      <footer className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footNote}>
            Dilekçem hukuki danışmanlık vermez. Metinler örnektir; durumunuza göre uyarlayın,
            gerekirse avukata danışın. Girdiğiniz bilgiler cihazınızdan çıkmaz.
          </p>
          <nav aria-label="Alt gezinme" className={s.footNav}>
            <Link to="/gizlilik">Gizlilik</Link>
            <Link to="/hakkinda">Hakkında</Link>
            <Link to="/veri-kaynaklari">Veri kaynakları</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
