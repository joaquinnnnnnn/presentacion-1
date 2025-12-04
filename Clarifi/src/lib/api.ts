import { ensureAccessToken } from '@/lib/client-auth'

export async function authedFetch(input: string, init?: RequestInit) {
  const tok = await ensureAccessToken()
  if (!tok) throw new Error('unauthorized')
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${tok}`)
  if (!headers.has('Content-Type') && (init?.body || init?.method === 'POST' || init?.method === 'PUT'))
    headers.set('Content-Type','application/json')
  return fetch(input, { ...init, headers, credentials: 'include' })
}
