export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyRefresh, signAccess, signRefresh } from '@/lib/jwt'
import { refreshCookieName, refreshCookieOptions } from '@/lib/cookies'

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const pair = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(`${refreshCookieName}=`))
  if (!pair) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const current = pair.split('=')[1]

  let payload: any
  try {
    payload = verifyRefresh(current)
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const c = await pool.connect()
  try {
    const row = await c.query('SELECT id, user_id, expires_at FROM refresh_tokens WHERE token=$1', [current])
    if (!row.rowCount) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    if (new Date(row.rows[0].expires_at) < new Date()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const userId = String(row.rows[0].user_id)
    const newAccess = signAccess({ sub: userId })
    const newRefresh = signRefresh({ sub: userId })
    const exp = new Date(Date.now() + 1000 * refreshCookieOptions.maxAge)

    await c.query('UPDATE refresh_tokens SET token=$1, expires_at=$2 WHERE id=$3', [newRefresh, exp, row.rows[0].id])

    const res = NextResponse.json({ access_token: newAccess })
    res.cookies.set(refreshCookieName, newRefresh, refreshCookieOptions)
    return res
  } finally {
    c.release()
  }
}
