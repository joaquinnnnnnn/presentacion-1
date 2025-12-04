export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { createDefaultCategories } from "@/lib/createDefaultCategories"
import { pool } from "@/lib/db"
import { hash } from '@/lib/hash'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const c = await pool.connect()
  try {
    const exist = await c.query('SELECT id FROM users WHERE email=$1', [email])
    if (exist.rowCount) return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
    const ph = await hash(password)
    const ins = await c.query(
      'INSERT INTO users(email,password_hash,verified) VALUES($1,$2,true) RETURNING id,email',
      [email, ph]
    )
    const newUser = ins.rows[0]
    await createDefaultCategories(pool, newUser.id)
    return NextResponse.json({ ok: true, user: newUser }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  } finally {
    c.release()
  }
}
