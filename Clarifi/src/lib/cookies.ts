export const refreshCookieName = 'refresh_token'

export const refreshCookieOptions = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: false,
  path: '/api/auth/refresh',
  maxAge: 60 * 60 * 24 * (parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10))
}
