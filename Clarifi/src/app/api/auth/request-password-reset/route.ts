import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // 1) Buscar usuario
      const userRes = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email.trim()]
      );

      // Siempre respondemos 200 aunque no exista el usuario (para no filtrar correos)
      if (userRes.rowCount === 0) {
        return NextResponse.json({ ok: true });
      }

      const userId = userRes.rows[0].id as number;

      // 2) Generar token aleatorio
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // 3) Guardar token en password_resets
      await client.query(
        `
        INSERT INTO password_resets (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `,
        [userId, token, expiresAt]
      );

      // 4) Construir link para el front
      const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:9002";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false, // usamos STARTTLS en puerto 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          // ⚠️ Solo para desarrollo: aceptar certificados autofirmados
          rejectUnauthorized: false,
        },
      });


      // 6) Enviar correo (si falla, lo capturamos abajo)
      await transporter.sendMail({
        from: `"Clarifi" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Restablecer tu contraseña – Clarifi",
        text: `Hola, visita el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
        html: `
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>Clarifi</strong>.</p>
          <p>
            Haz clic en el siguiente enlace para seguir el proceso:<br/>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
          </p>
          <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>
        `,
      });

      // Si todo fue bien
      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error en /api/auth/request-password-reset:", err);
    // Aun así devolvemos 200 para que el formulario muestre mensaje amable
    return NextResponse.json({ ok: true });
  }
}
