// Cloudflare Pages middleware. `_headers` does not apply to the platform's 404 fallback, so this adds
// `Cache-Control: no-transform` to every response. That value stops Cloudflare from injecting its
// Web Analytics beacon (a third-party script) into the HTML.
interface Context {
  next: () => Promise<Response>
}

export const onRequest = async ({ next }: Context): Promise<Response> => {
  const response = await next()
  const out = new Response(response.body, response)
  const current = out.headers.get('Cache-Control')
  if (!current?.includes('no-transform')) {
    out.headers.set('Cache-Control', current ? `${current}, no-transform` : 'no-transform')
  }
  return out
}
