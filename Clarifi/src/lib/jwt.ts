import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET as string
const refreshSecret = process.env.JWT_REFRESH_SECRET as string
const accessMinutes = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || '30', 10)
const refreshDays = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10)

export const signAccess = (payload: object) =>
  jwt.sign(payload, accessSecret, { expiresIn: `${accessMinutes}m` })

export const verifyAccess = (t: string) => jwt.verify(t, accessSecret)

export const signRefresh = (payload: object) =>
  jwt.sign(payload, refreshSecret, { expiresIn: `${refreshDays}d` })

export const verifyRefresh = (t: string) => jwt.verify(t, refreshSecret)
