"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";
import { useFinTrack } from "../fin-track-app";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Row = { key: string; year: number; month: number; Ingresos: number; Gastos: number; Balance: number };

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const COLOR_INGRESOS = "#16a34a";
const COLOR_GASTOS = "#ef4444";
const COLOR_BALANCE = "#0ea5e9";

export default function ReportsView() {
  const { transactions, categories } = useFinTrack();
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categoryMode, setCategoryMode] = useState<"expense" | "income">("expense");

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const tx of transactions) {
      const d = tx.date instanceof Date ? tx.date : new Date(String(tx.date));
      years.add(d.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const monthly: Row[] = useMemo(() => {
    const acc = new Map<string, Row>();

    for (const tx of transactions) {
      const d = tx.date instanceof Date ? tx.date : new Date(String(tx.date));
      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      if (yearFilter !== "all" && y !== yearFilter) continue;
      if (categoryFilter !== "all" && (tx.categoryId ?? "") !== categoryFilter) continue;

      const key = `${y}-${String(m).padStart(2, "0")}`;

      if (!acc.has(key)) {
        acc.set(key, { key, year: y, month: m, Ingresos: 0, Gastos: 0, Balance: 0 });
      }

      const row = acc.get(key)!;
      if (tx.type === "income") row.Ingresos += tx.amount;
      else row.Gastos += tx.amount;
    }

    const arr = Array.from(acc.values()).map((r) => ({ ...r, Balance: r.Ingresos - r.Gastos }));
    arr.sort((a, b) => (a.year - b.year) || (a.month - b.month));
    return arr;
  }, [transactions, yearFilter, categoryFilter]);

  const dataAll = monthly.map((d) => ({ name: `${MESES[d.month - 1]} ${d.year}`, ...d }));

  const selected =
    monthFilter === "all"
      ? null
      : monthly.find(
          (r) =>
            r.month === monthFilter &&
            r.year === (monthly[0]?.year ?? new Date().getFullYear())
        );

  const dataSelected = selected ? [{ name: `${MESES[selected.month - 1]} ${selected.year}`, ...selected }] : [];

  const currentCategory =
    categoryFilter === "all" ? null : categories.find((c) => c.id === categoryFilter);

  const ingresosColor = currentCategory ? currentCategory.color : COLOR_INGRESOS;
  const gastosColor = currentCategory ? currentCategory.color : COLOR_GASTOS;
  const balanceColor = currentCategory ? currentCategory.color : COLOR_BALANCE;

  const selectedKind = currentCategory?.kind ?? null;
  const showIngresos = !selectedKind || selectedKind === "income";
  const showGastos = !selectedKind || selectedKind === "expense";
  const showBalance = !selectedKind;

  const categoryData = useMemo(() => {
    const map = new Map<
      string,
      { categoryId: string; name: string; Monto: number; color: string }
    >();

    for (const tx of transactions) {
      const d = tx.date instanceof Date ? tx.date : new Date(String(tx.date));
      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      if (yearFilter !== "all" && y !== yearFilter) continue;
      if (monthFilter !== "all" && m !== monthFilter) continue;
      if (tx.type !== categoryMode) continue;

      const catId = String(tx.categoryId ?? "sin_categoria");
      const cat = categories.find((c) => c.id === tx.categoryId);
      const key = catId;

      if (!map.has(key)) {
        map.set(key, {
          categoryId: catId,
          name: cat?.name ?? "Sin categoría",
          Monto: 0,
          color: cat?.color ?? (categoryMode === "expense" ? COLOR_GASTOS : COLOR_INGRESOS)
        });
      }

      map.get(key)!.Monto += tx.amount;
    }

    return Array.from(map.values()).sort((a, b) => b.Monto - a.Monto);
  }, [transactions, categories, yearFilter, monthFilter, categoryMode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte Mensual</CardTitle>
        <CardDescription>Comparativa de ingresos y gastos del año.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={yearFilter === "all" ? "all" : String(yearFilter)}
            onValueChange={(v) => setYearFilter(v === "all" ? "all" : Number(v))}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={monthFilter === "all" ? "default" : "outline"}
              onClick={() => setMonthFilter("all")}
            >
              Todo el año
            </Button>
            {MESES.map((m, i) => (
              <Button
                key={m}
                variant={monthFilter === i + 1 ? "default" : "outline"}
                onClick={() => setMonthFilter(i + 1)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        {monthly.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay datos suficientes para generar el reporte.
          </p>
        ) : monthFilter === "all" ? (
          <>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataAll}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CL")}`} />
                  <Legend />
                  {showIngresos && (
                    <Bar dataKey="Ingresos" name="Ingresos" fill={ingresosColor} />
                  )}
                  {showGastos && (
                    <Bar dataKey="Gastos" name="Gastos" fill={gastosColor} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {showBalance && (
              <div className="h-[320px] mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataAll}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CL")}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Balance"
                      name="Balance"
                      stroke={balanceColor}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataSelected}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CL")}`} />
                <Legend />
                {showIngresos && (
                  <Bar dataKey="Ingresos" name="Ingresos" fill={ingresosColor} />
                )}
                {showGastos && (
                  <Bar dataKey="Gastos" name="Gastos" fill={gastosColor} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="h-[360px] mt-10">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {categoryMode === "expense" ? "Gastos" : "Ingresos"} por categoría{" "}
                {yearFilter !== "all" ? `(${yearFilter})` : "(todos los años)"}
                {monthFilter !== "all" ? ` - ${MESES[monthFilter - 1]}` : ""}
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={categoryMode === "expense" ? "default" : "outline"}
                  onClick={() => setCategoryMode("expense")}
                >
                  Gastos
                </Button>
                <Button
                  size="sm"
                  variant={categoryMode === "income" ? "default" : "outline"}
                  onClick={() => setCategoryMode("income")}
                >
                  Ingresos
                </Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CL")}`} />
                <Legend />
                <Bar
                  dataKey="Monto"
                  name={categoryMode === "expense" ? "Gastos" : "Ingresos"}
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={`${entry.categoryId}-${categoryMode}`}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
