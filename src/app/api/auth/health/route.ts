import { NextResponse } from 'next/server'
import { hash, verifyHash } from '@/lib/hash'
import { signAccess, verifyAccess, signRefresh, verifyRefresh } from '@/lib/jwt'
import { refreshCookieName, refreshCookieOptions } from '@/lib/cookies'

export async function GET() {
  const h = await hash('x')
  const ok = await verifyHash('x', h)
  const at = signAccess({ sub: '1' })
  const rt = signRefresh({ sub: '1' })
  verifyAccess(at)
  verifyRefresh(rt)
  const res = NextResponse.json({ ok, at_len: at.length, rt_len: rt.length, cookie: refreshCookieName })
  res.cookies.set(refreshCookieName, rt, refreshCookieOptions)
  return res
}
