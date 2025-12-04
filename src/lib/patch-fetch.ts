// src/lib/patch-fetch.ts
'use client'
import { ensureAccessToken } from '@/lib/client-auth'

let patched = false

export function patchFetchAuth() {
  if (patched) return
  patched = true

  const origFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url


    if (url.startsWith('/api/auth/')) {
      return origFetch(input, init as any)
    }

    // Solo para el resto de /api/*
    if (url.startsWith('/api/')) {
      try {
        const tok = await ensureAccessToken()
        if (tok) {
          const headers = new Headers(init?.headers)
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${tok}`)
          }
          const merged: RequestInit = {
            credentials: init?.credentials ?? 'include',
            ...init,
            headers,
          }
          return origFetch(input, merged)
        }
      } catch {
        // si no hay token, deja pasar la request tal cual
      }
    }

    return origFetch(input, init as any)
  }
}
