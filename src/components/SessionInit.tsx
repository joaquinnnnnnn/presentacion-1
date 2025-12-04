'use client'
import { useEffect } from 'react'
import { refreshAccessToken } from '@/lib/client-auth'
import { patchFetchAuth } from '@/lib/patch-fetch'

export default function SessionInit() {
  useEffect(() => {
    patchFetchAuth()
    refreshAccessToken()
  }, [])
  return null
}
