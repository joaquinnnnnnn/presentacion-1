export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyHash } from '@/lib/hash'
import { signAccess, signRefresh } from '@/lib/jwt'
import { refreshCookieName, refreshCookieOptions } from '@/lib/cookies'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const c = await pool.connect()
  try {
    const q = await c.query('SELECT id,email,password_hash,verified FROM users WHERE email=$1', [email])
    if (!q.rowCount) return NextResponse.json({ error: 'invalid' }, { status: 401 })
    const u = q.rows[0]
    const ok = await verifyHash(password, u.password_hash)
    if (!ok) return NextResponse.json({ error: 'invalid' }, { status: 401 })
    const access = signAccess({ sub: String(u.id), email: u.email })
    const refresh = signRefresh({ sub: String(u.id) })
    const exp = new Date(Date.now() + 1000 * refreshCookieOptions.maxAge)
    await c.query('INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)', [u.id, refresh, exp])
    const res = NextResponse.json({ access_token: access, user: { id: u.id, email: u.email } })
    res.cookies.set(refreshCookieName, refresh, refreshCookieOptions)
    return res
  } finally {
    c.release()
  }
}
