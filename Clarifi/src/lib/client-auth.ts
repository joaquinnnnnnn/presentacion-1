// src/lib/client-auth.ts
let accessToken: string | null = null
let inflightRefresh: Promise<string | null> | null = null

export async function refreshAccessToken() {
  // Evita refrescos paralelos
  if (inflightRefresh) return inflightRefresh
  inflightRefresh = (async () => {
    try {
      const r = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) {
        accessToken = null
        return null
      }
      const j = await r.json()
      accessToken = j.access_token ?? null
      return accessToken
    } catch {
      accessToken = null
      return null
    } finally {
      inflightRefresh = null
    }
  })()
  return inflightRefresh
}

export function getAccessToken() {
  return accessToken
}

export async function ensureAccessToken() {
  if (accessToken) return accessToken
  return await refreshAccessToken()
}

export async function fetchMe() {
  const tok = await ensureAccessToken()
  if (!tok) return null
  const r = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${tok}` },
    credentials: 'include',
  })
  if (!r.ok) return null
  return await r.json()
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  accessToken = null
}
