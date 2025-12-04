export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { refreshCookieName, refreshCookieOptions } from '@/lib/cookies'

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const pair = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(`${refreshCookieName}=`))
  const c = await pool.connect()
  try {
    if (pair) {
      const token = pair.split('=')[1]
      await c.query('DELETE FROM refresh_tokens WHERE token=$1', [token])
    }
  } finally {
    c.release()
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(refreshCookieName, '', { ...refreshCookieOptions, maxAge: 0 })
  return res
}
