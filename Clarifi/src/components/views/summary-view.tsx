"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinTrack } from "../fin-track-app";
import { formatCurrency } from "@/lib/utils";

export default function SummaryView() {
  const { transactions, settings } = useFinTrack();

  const { income, expense, balance } = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Balance Actual</CardTitle>
          <CardDescription>Basado en todas las transacciones</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {formatCurrency(balance, settings.currency, settings.fxRate)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos Totales</CardTitle>
          <CardDescription>Este período</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold text-emerald-600">
          {formatCurrency(income, settings.currency, settings.fxRate)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos Totales</CardTitle>
          <CardDescription>Este período</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold text-red-600">
          {formatCurrency(expense, settings.currency, settings.fxRate)}
        </CardContent>
      </Card>
    </div>
  );
}
