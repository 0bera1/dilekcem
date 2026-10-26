import { Head } from 'vite-react-ssg'
import { SITE_NAME, canonicalUrl } from '../lib/site'

interface SeoProps {
  title: string
  description: string
  path: string
  jsonLd?: object[]
  noindex?: boolean
}

export function Seo({ title, description, path, jsonLd = [], noindex = false }: SeoProps) {
  const full = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const url = canonicalUrl(path)
  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary" />
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Head>
  )
}
