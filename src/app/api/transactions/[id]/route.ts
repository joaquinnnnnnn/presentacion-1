import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPool = global as unknown as { pgPool?: Pool };
export const pool =
  globalForPool.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPool.pgPool) globalForPool.pgPool = pool;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const r = await pool.query(`delete from transactions where id = $1 returning id`, [id]);

    if (r.rowCount === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/transactions/[id] error:", e);
    return NextResponse.json({ error: "failed to delete transaction" }, { status: 500 });
  }
}
