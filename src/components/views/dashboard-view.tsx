"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinTrack } from "../fin-track-app";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PALETTE = ["#3B82F6","#22C55E","#F59E0B","#EF4444","#8B5CF6","#10B981","#F472B6","#38BDF8","#C084FC","#84CC16"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function DashboardView() {
  const { transactions, categories, settings } = useFinTrack();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const t of transactions) {
      const d = t.date instanceof Date ? t.date : new Date(String(t.date));
      years.add(d.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = t.date instanceof Date ? t.date : new Date(String(t.date));
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (yearFilter !== "all" && y !== yearFilter) return false;
      if (monthFilter !== "all" && m !== monthFilter) return false;
      return true;
    });
  }, [transactions, yearFilter, monthFilter]);

  const totals = useMemo(() => {
    let inc = 0, exp = 0;
    for (const t of filteredTransactions) {
      if (t.type === "income") inc += t.amount;
      else exp += Math.abs(t.amount);
    }
    return { inc, exp, bal: inc - exp };
  }, [filteredTransactions]);

  const pieData = useMemo(() => {
    const byCat = new Map<string, { name: string; value: number; color?: string }>();
    for (const t of filteredTransactions) {
      if (t.type !== "expense") continue;
      const cat = categories.find(c => c.id === t.categoryId);
      const key = cat?.name ?? "Sin categoría";
      if (!byCat.has(key)) byCat.set(key, { name: key, value: 0, color: cat?.color });
      byCat.get(key)!.value += Math.abs(t.amount);
    }
    return Array.from(byCat.values()).filter(d => d.value > 0).sort((a,b)=>b.value-a.value);
  }, [filteredTransactions, categories]);

  const topTwo = pieData.slice(0, 2);

  return (
    <div className="relative">
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <Select
          value={yearFilter === "all" ? "all" : String(yearFilter)}
          onValueChange={v => setYearFilter(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            {yearOptions.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={monthFilter === "all" ? "all" : String(monthFilter)}
          onValueChange={v => setMonthFilter(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los meses</SelectItem>
            {MESES.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Balance Actual</CardTitle>
            <CardDescription>Basado en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals.bal, settings.currency)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
            <CardDescription>Este período</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600">
            {formatCurrency(totals.inc, settings.currency)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos Totales</CardTitle>
            <CardDescription>Este período</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            {formatCurrency(totals.exp, settings.currency)}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Distribución de Gastos</CardTitle>
          <CardDescription>Un vistazo a dónde va tu dinero por categoría.</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-center text-muted-foreground">Aún no hay gastos para graficar en este período.</p>
          ) : (
            <>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                    >
                      {pieData.map((d, i) => (
                        <Cell
                          key={d.name}
                          fill={d.color || PALETTE[i % PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v, settings.currency)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {topTwo.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground flex flex-col gap-1 sm:items-center">
                  <span className="font-medium text-foreground">Top categorías de gasto del período:</span>
                  {topTwo.map((c, idx) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: c.color || PALETTE[idx % PALETTE.length] }}
                      />
                      <span>
                        {idx + 1}. {c.name}:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(c.value, settings.currency)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-6 left-6 z-[999] h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-black bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition"
        aria-label="Agregar transacción"
        title="Agregar transacción"
      >
        +
      </button>

      <AddTransactionModal isOpen={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
