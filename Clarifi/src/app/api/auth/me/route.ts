export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { verifyAccess } from '@/lib/jwt'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const [scheme, token] = auth.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  let payload: any
  try {
    payload = verifyAccess(token)
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const c = await pool.connect()
  try {
    const q = await c.query(
      'SELECT id, email, verified, created_at FROM users WHERE id=$1',
      [payload.sub]
    )
    if (!q.rowCount) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return NextResponse.json(q.rows[0])
  } finally {
    c.release()
  }
}
