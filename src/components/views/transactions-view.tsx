"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinTrack } from "../fin-track-app";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";

const PER_PAGE = 10;

function formatLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function dateKeyOf(date: string | Date): string {
  return typeof date === "string" ? date : formatLocalYMD(date);
}

export default function TransactionsView() {
  const { transactions, categories, settings } = useFinTrack();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    for (const tx of transactions) {
      const dk = dateKeyOf(tx.date);
      years.add(dk.slice(0, 4));
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(
    () =>
      transactions
        .filter((tx) => {
          const descOk = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
          const typeOk = typeFilter === "all" || tx.type === typeFilter;
          const catOk = categoryFilter === "all" || (tx.categoryId ?? "") === categoryFilter;

          const dk = dateKeyOf(tx.date);
          const year = dk.slice(0, 4);
          const month = dk.slice(5, 7);

          const yearOk = yearFilter === "all" || year === yearFilter;
          const monthOk = monthFilter === "all" || month === monthFilter;

          return descOk && typeOk && catOk && yearOk && monthOk;
        })
        .sort((a, b) => {
          const da = dateKeyOf(a.date);
          const db = dateKeyOf(b.date);
          return db.localeCompare(da);
        }),
    [transactions, searchTerm, typeFilter, categoryFilter, yearFilter, monthFilter]
  );

  const slice = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, (page - 1) * PER_PAGE + PER_PAGE),
    [filtered, page]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const getCategory = (id?: string | null) => categories.find((c) => c.id === id);

  async function deleteTx(id: string) {
    if (!confirm("¿Seguro que deseas eliminar esta transacción?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Error al eliminar transacción");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones</CardTitle>
        <CardDescription>Revisa y gestiona tus transacciones.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar por descripción..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as "all" | "income" | "expense")}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingreso</SelectItem>
              <SelectItem value="expense">Gasto</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              <SelectItem value="01">Enero</SelectItem>
              <SelectItem value="02">Febrero</SelectItem>
              <SelectItem value="03">Marzo</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Mayo</SelectItem>
              <SelectItem value="06">Junio</SelectItem>
              <SelectItem value="07">Julio</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Septiembre</SelectItem>
              <SelectItem value="10">Octubre</SelectItem>
              <SelectItem value="11">Noviembre</SelectItem>
              <SelectItem value="12">Diciembre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="w-[80px] text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {slice.length ? (
                slice.map((tx) => {
                  const cat = getCategory(tx.categoryId);
                  const dateKey = dateKeyOf(tx.date);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell>
                        {cat && (
                          <Badge
                            variant="outline"
                            style={{ borderColor: cat.color, color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{dateKey}</TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          tx.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount, settings.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          className="bg-red-600 text-white hover:bg-red-700"
                          size="icon"
                          onClick={() => deleteTx(tx.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron transacciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
