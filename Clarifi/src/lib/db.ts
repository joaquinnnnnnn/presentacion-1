// src/lib/db.ts
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL as string

export const pool = new Pool({
  connectionString,
  ssl: false
})

export async function dbQuery<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params)
  return res.rows as T[]
}
