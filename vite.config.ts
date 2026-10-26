import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { ViteReactSSGOptions } from 'vite-react-ssg'

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** Adds the CSP meta tag to production HTML only (the dev server needs inline styles and a websocket). */
const cspPlugin = (): Plugin => ({
  name: 'dilekcem-csp',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) =>
      html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${CSP}">`),
  },
})

// Inline <style> blocks would violate the page CSP (style-src 'self'),
// so critical-CSS inlining stays off.
const ssgOptions: ViteReactSSGOptions = {
  beastiesOptions: false,
  dirStyle: 'nested',
  formatting: 'none',
}

export default defineConfig({
  base: '/',
  plugins: [react(), cspPlugin()],
  ssgOptions,
  build: { cssCodeSplit: false, assetsInlineLimit: 0 },
})
