import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './components/Layout'
import ApplyGuide from './pages/ApplyGuide'
import Home from './pages/Home'
import Hub from './pages/Hub'
import NotFound from './pages/NotFound'
import { About, DataSources, Privacy } from './pages/Static'
import TemplatePage from './pages/TemplatePage'
import { templates } from './templates'

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'dilekce', Component: Hub },
      {
        path: 'dilekce/:slug',
        Component: TemplatePage,
        getStaticPaths: () => templates.map((t) => `dilekce/${t.slug}`),
      },
      { path: 'basvuru-yolu', Component: ApplyGuide },
      { path: 'gizlilik', Component: Privacy },
      { path: 'hakkinda', Component: About },
      { path: 'veri-kaynaklari', Component: DataSources },
      { path: '404', Component: NotFound },
      { path: '*', Component: NotFound },
    ],
  },
]
