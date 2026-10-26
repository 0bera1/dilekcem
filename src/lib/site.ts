export const SITE_URL = 'https://dilekcem.beraekimci.com.tr'
export const SITE_NAME = 'Dilekçem'
export const TAGLINE = 'Hakkını aramak için doğru yazı, doğru adrese.'

/** Directory-style URLs end with a slash, which is how the static host serves them. */
export const canonicalUrl = (path: string): string =>
  `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`
