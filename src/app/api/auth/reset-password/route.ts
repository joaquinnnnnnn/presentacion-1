// src/app/api/auth/reset-password/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hash } from '@/lib/hash';

export async function POST(req: Request) {
  const { token, new_password } = await req.json().catch(() => ({}));

  if (!token || typeof token !== 'string' || !new_password || typeof new_password !== 'string') {
    return NextResponse.json(
      { error: 'invalid_payload' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    // 1) Buscar el reset token
    const resetRes = await client.query(
      `SELECT id, user_id, expires_at, used
         FROM password_resets
        WHERE token = $1
        ORDER BY id DESC
        LIMIT 1`,
      [token]
    );

    if (resetRes.rowCount === 0) {
      return NextResponse.json(
        { error: 'invalid_or_expired_token' },
        { status: 400 }
      );
    }

    const resetRow = resetRes.rows[0] as {
      id: number;
      user_id: number;
      expires_at: string;
      used: boolean;
    };

    // 2) Validar que no esté usado y no esté vencido
    const now = new Date();
    const expiresAt = new Date(resetRow.expires_at);

    if (resetRow.used || expiresAt.getTime() <= now.getTime()) {
      return NextResponse.json(
        { error: 'invalid_or_expired_token' },
        { status: 400 }
      );
    }

    // 3) Hashear nueva contraseña
    const pwHash = await hash(new_password);

    // 4) Actualizar usuario + marcar token como usado, todo en transacción
    await client.query('BEGIN');

    await client.query(
      `UPDATE users
          SET password_hash = $1
        WHERE id = $2`,
      [pwHash, resetRow.user_id]
    );

    await client.query(
      `UPDATE password_resets
          SET used = TRUE,
              used_at = NOW()
        WHERE id = $1`,
      [resetRow.id]
    );

    await client.query('COMMIT');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/auth/reset-password error:', err);
    try {
      await client.query('ROLLBACK');
    } catch {}
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
