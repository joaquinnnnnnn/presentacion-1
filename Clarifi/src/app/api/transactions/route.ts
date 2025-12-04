import { NextResponse } from "next/server";
import { Pool, types } from "pg";
import jwt from "jsonwebtoken";
export const runtime = "nodejs";

types.setTypeParser(1082, (val) => val);

const globalForPool = global as unknown as { pgPool?: Pool };
export const pool =
  globalForPool.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPool.pgPool) globalForPool.pgPool = pool;

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

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  const whereParts: string[] = ["t.user_id = $1"];
  const values: (number | string)[] = [userId];
  let idx = 2;

  if (yearParam) {
    const year = Number(yearParam);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "year invalid" }, { status: 400 });
    }
    whereParts.push(`EXTRACT(YEAR FROM t.date) = $${idx}`);
    values.push(year);
    idx++;
  }

  if (monthParam) {
    const month = Number(monthParam);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "month invalid" }, { status: 400 });
    }
    whereParts.push(`EXTRACT(MONTH FROM t.date) = $${idx}`);
    values.push(month);
    idx++;
  }

  const query = `
    select
      t.id,
      t.description,
      t.amount,
      case when t.type = 'expense' then -t.amount else t.amount end as "signedAmount",
      to_char(t.date, 'YYYY-MM-DD') as date,
      t.type,
      t.category_id as "categoryId",
      c.name as "categoryName",
      c.kind as "categoryKind",
      c.color,
      c.icon
    from transactions t
    left join categories c on c.id = t.category_id
    where ${whereParts.join(" and ")}
    order by t.date desc, t.created_at desc
  `;

  const r = await pool.query(query, values);

  return NextResponse.json(r.rows);
}

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();

    const description = String(body.description ?? "").trim();
    const amount = Number(body.amount);
    const rawDate = String(body.date ?? "").trim();
    const type = body.type === "income" ? "income" : "expense";
    const categoryId = body.categoryId ? String(body.categoryId) : null;
    const categoryName = body.categoryName ? String(body.categoryName).trim() : "";

    if (!description)
      return NextResponse.json({ error: "description required" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "amount invalid" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate))
      return NextResponse.json({ error: "date invalid" }, { status: 400 });

    const storedAmount = Math.round(Math.abs(amount));

    let finalCategoryId: string | null = null;

    if (categoryId) {
      finalCategoryId = categoryId;
    } else if (categoryName) {
      const q = await pool.query(
        `select id from categories where lower(name) = lower($1) and kind = $2 and user_id = $3 limit 1`,
        [categoryName, type, userId]
      );
      if (q.rowCount && q.rowCount > 0) {
        finalCategoryId = q.rows[0].id;
      } else {
        const ins = await pool.query(
          `insert into categories (name, kind, user_id) values ($1, $2, $3) returning id`,
          [categoryName, type, userId]
        );
        finalCategoryId = ins.rows[0].id;
      }
    }

    const insTx = await pool.query(
      `insert into transactions (description, amount, date, type, category_id, user_id)
       values ($1, $2, $3::date, $4, $5, $6)
       returning id, description, amount,
                 to_char(date, 'YYYY-MM-DD') as date,
                 type, category_id as "categoryId"`,
      [description, storedAmount, rawDate, type, finalCategoryId, userId]
    );

    return NextResponse.json(insTx.rows[0], { status: 201 });
  } catch (e) {
    console.error("POST /api/transactions error:", e);
    return NextResponse.json({ error: "failed to create transaction" }, { status: 500 });
  }
}
