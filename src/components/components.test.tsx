import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '../pages/Home'
import { getTemplate } from '../templates'
import { DecisionFinder } from './DecisionFinder'
import { Layout } from './Layout'
import { Workbench } from './Workbench'

vi.mock('vite-react-ssg', () => ({ Head: () => null }))

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

describe('Workbench', () => {
  const def = getTemplate('abonelik-iptali')!

  it('updates the paper as the form is filled', async () => {
    const user = userEvent.setup()
    wrap(<Workbench def={def} />)
    const paper = screen.getByRole('region', { name: 'Dilekçe önizlemesi' })
    expect(within(paper).getAllByText('[Ad Soyad]').length).toBeGreaterThan(0)

    await user.type(screen.getByLabelText('Ad Soyad'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText('Firma adı'), 'istanbul ılık su')

    expect(within(paper).getByText('Ayşe Yılmaz')).toBeInTheDocument()
    expect(within(paper).getByText('İSTANBUL ILIK SU')).toBeInTheDocument()
  })

  it('defaults the date to today after mount', async () => {
    wrap(<Workbench def={def} />)
    const input = (await screen.findByLabelText('Tarih')) as HTMLInputElement
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('shows field errors tied to the field and blocks export when required fields are empty', async () => {
    const user = userEvent.setup()
    wrap(<Workbench def={def} />)
    const name = screen.getByLabelText('Ad Soyad')
    await user.click(name)
    await user.tab()
    const err = await screen.findByText('Bu alan zorunludur.')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name.getAttribute('aria-describedby')).toContain(err.id)

    await user.click(screen.getByRole('button', { name: 'PDF olarak indir' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('zorunlu alanlar')
  })

  it('validates optional fields only when filled', async () => {
    const user = userEvent.setup()
    wrap(<Workbench def={def} />)
    const tckn = screen.getByLabelText(/T\.C\. Kimlik No/)
    await user.type(tckn, '12345678901')
    await user.tab()
    expect(await screen.findByText(/11 haneli ve geçerli/)).toBeInTheDocument()
    await user.clear(tckn)
    await user.type(tckn, '10000000146')
    await user.tab()
    expect(screen.queryByText(/11 haneli ve geçerli/)).not.toBeInTheDocument()
  })

  it('keeps drafts off by default', () => {
    wrap(<Workbench def={def} />)
    expect(screen.getByRole('checkbox', { name: 'Taslak saklamayı aç' })).not.toBeChecked()
    expect(window.localStorage.length).toBe(0)
  })

  it('saves and deletes a draft only after drafts are switched on, never storing the T.C. kimlik no', async () => {
    const user = userEvent.setup()
    wrap(<Workbench def={def} />)
    await user.click(screen.getByText('Taslaklarım'))
    await user.type(screen.getByLabelText('Ad Soyad'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText(/T\.C\. Kimlik No/), '10000000146')
    await user.click(screen.getByRole('checkbox', { name: 'Taslak saklamayı aç' }))
    await user.click(screen.getByRole('button', { name: /Bu taslağı kaydet/ }))
    const stored = window.localStorage.getItem('dilekcem:drafts') ?? ''
    expect(stored).toContain('Ayşe Yılmaz')
    expect(stored).not.toContain('10000000146')

    await user.click(screen.getByRole('button', { name: /taslağını sil/ }))
    expect(window.localStorage.getItem('dilekcem:drafts')).toBe('[]')
  })
})

describe('theme toggle', () => {
  it('toggles the theme attribute and remembers it', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    )
    const btn = await screen.findByRole('button', { name: /Koyu tema/ })
    await user.click(btn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem('dilekcem:theme')).toBe('dark')
    await user.click(btn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('still works when localStorage throws', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: /Koyu tema/ }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    spy.mockRestore()
  })
})

describe('category tabs', () => {
  it('moves and selects with arrow keys, Home and End', async () => {
    const user = userEvent.setup()
    wrap(<Home />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Tüketici',
      'Kamu',
      'Kişisel veri',
      'İş ve okul',
      'Rehber',
    ])
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')

    tabs[0]!.focus()
    await user.keyboard('{ArrowRight}')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveFocus()
    expect(screen.getByRole('button', { name: /Trafik cezası/ })).toBeInTheDocument()

    await user.keyboard('{End}')
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowLeft}')
    expect(tabs[4]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Home}')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('links the active tab to its panel', () => {
    wrap(<Home />)
    const tab = screen.getByRole('tab', { selected: true })
    const panel = screen.getByRole('tabpanel')
    expect(tab.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
  })

  it('switches the form when another template is picked', async () => {
    const user = userEvent.setup()
    wrap(<Home />)
    await user.click(screen.getByRole('button', { name: /Ayıplı ürün/ }))
    expect(await screen.findByLabelText('Ayıbın açıklaması')).toBeInTheDocument()
  })
})

describe('decision finder', () => {
  it('walks to a template result and can go back', async () => {
    const user = userEvent.setup()
    wrap(<DecisionFinder />)
    await user.click(screen.getByRole('button', { name: /Bir kamu kurumu/ }))
    await user.click(screen.getByRole('button', { name: /Trafik cezasına itiraz/ }))
    expect(screen.getByRole('link', { name: /Dilekçeyi hazırla/ })).toHaveAttribute(
      'href',
      '/dilekce/trafik-cezasi-itirazi',
    )
    await user.click(screen.getByRole('button', { name: 'Geri' }))
    expect(screen.getByRole('heading', { name: 'Ne yapmak istiyorsunuz?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Baştan başla' }))
    expect(screen.getByRole('heading', { name: 'Sorununuz hangi alanda?' })).toBeInTheDocument()
  })
})
