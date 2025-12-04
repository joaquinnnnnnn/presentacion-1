import { Pool } from "pg";

const defaults = [
  { name: "Comida", color: "#8e44ad", icon: "Utensils", kind: "expense" },
  { name: "Compras", color: "#3498db", icon: "ShoppingCart", kind: "expense" },
  { name: "Hogar", color: "#27ae60", icon: "Home", kind: "expense" },
  { name: "Salud", color: "#f1c40f", icon: "Heart", kind: "expense" },
  { name: "Transporte", color: "#e67e22", icon: "Car", kind: "expense" },
  { name: "Salario", color: "#16a085", icon: "Wallet", kind: "income" },
  { name: "Ventas", color: "#2980b9", icon: "DollarSign", kind: "income" }
];

export async function createDefaultCategories(pool: Pool, userId: number) {
  const has = await pool.query(`select 1 from categories where user_id=$1 limit 1`, [userId]);
  if (has.rowCount) return 0;
  let inserted = 0;
  for (const c of defaults) {
    await pool.query(
      `insert into categories (name, color, icon, kind, user_id)
       values ($1,$2,$3,$4,$5)
       on conflict (user_id, name, kind) do nothing`,
      [c.name, c.color, c.icon, c.kind, userId]
    );
    inserted++;
  }
  return inserted;
}
