import { ViteReactSSG } from 'vite-react-ssg'
import './styles/global.css'
import { routes } from './routes'

export const createRoot = ViteReactSSG({ routes })
