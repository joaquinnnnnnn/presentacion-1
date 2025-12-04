import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
export const runtime = 'nodejs';


const globalForPool = global as unknown as { pgPool?: Pool };
export const pool =
  globalForPool.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPool.pgPool) globalForPool.pgPool = pool;

// Helper para extraer user_id desde el token JWT
function getUserId(req: Request): number | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;

  const token = auth.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { sub?: number };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

// Obtener categorías del usuario actual
export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await pool.query(
    `SELECT id, name, color, icon, kind
       FROM categories
      WHERE user_id = $1
      ORDER BY name ASC`,
    [userId]
  );

  return NextResponse.json(r.rows);
}

// Crear una nueva categoría para el usuario actual
export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const color = String(body.color ?? "#888888").trim();
    const icon = String(body.icon ?? "Tag").trim();
    const kind: "income" | "expense" =
      body.kind === "income" ? "income" : "expense";

    if (!name)
      return NextResponse.json({ error: "name required" }, { status: 400 });

    // Evita duplicados por usuario
    const exists = await pool.query(
      `SELECT 1
         FROM categories
        WHERE lower(name) = lower($1)
          AND kind = $2
          AND user_id = $3`,
      [name, kind, userId]
    );

    if (exists.rowCount > 0) {
      return NextResponse.json(
        { error: "category already exists" },
        { status: 409 }
      );
    }

    const ins = await pool.query(
      `INSERT INTO categories (name, color, icon, kind, user_id)
            VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, color, icon, kind`,
      [name, color, icon, kind, userId]
    );

    return NextResponse.json(ins.rows[0], { status: 201 });
  } catch (e) {
    console.error("POST /api/categories error:", e);
    return NextResponse.json({ error: "failed to create category" }, { status: 500 });
  }
}
