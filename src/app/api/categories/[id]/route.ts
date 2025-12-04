import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function isUUID(v?: string | null) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isUUID(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const name =
      typeof body.name === "string" ? String(body.name).trim() : undefined;
    const color =
      typeof body.color === "string" ? String(body.color).trim() : undefined;
    const icon =
      typeof body.icon === "string" ? String(body.icon).trim() : undefined;
    const kind =
      body.kind === "income"
        ? "income"
        : body.kind === "expense"
        ? "expense"
        : undefined;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (color !== undefined) {
      fields.push(`color = $${idx++}`);
      values.push(color);
    }
    if (icon !== undefined) {
      fields.push(`icon = $${idx++}`);
      values.push(icon);
    }
    if (kind !== undefined) {
      fields.push(`kind = $${idx++}`);
      values.push(kind);
    }

    if (!fields.length) {
      return NextResponse.json(
        { error: "no fields to update" },
        { status: 400 }
      );
    }

    const sql = `
      update categories
      set ${fields.join(", ")}
      where id = $${idx}
      returning id, name, color, icon, kind
    `;
    values.push(id);

    const r = await pool.query(sql, values);
    if (r.rowCount === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(r.rows[0]);
  } catch (e) {
    console.error("PUT /api/categories/[id] error:", e);
    return NextResponse.json(
      { error: "failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isUUID(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    try {
      const r = await pool.query(
        `
        delete from categories
        where id = $1
        returning id
      `,
        [id]
      );
      if (r.rowCount === 0) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      if (err?.code === "23503") {
        return NextResponse.json(
          { error: "category is used by transactions" },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (e) {
    console.error("DELETE /api/categories/[id] error:", e);
    return NextResponse.json(
      { error: "failed to delete category" },
      { status: 500 }
    );
  }
}
