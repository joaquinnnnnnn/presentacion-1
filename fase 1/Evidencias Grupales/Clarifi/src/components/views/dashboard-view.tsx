"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFinTrack } from '../fin-track-app';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { CategoryDonutChart } from '../charts/category-donut-chart';

export default function DashboardView(){
  const { transactions, settings } = useFinTrack();
  const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const balance = income - expense;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Balance Actual</CardTitle><Wallet className="h-4 w-4 text-gray-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(balance, settings.currency)}</div><p className="text-xs text-gray-500">Basado en todas las transacciones</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle><ArrowUpRight className="h-4 w-4 text-green-600"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(income, settings.currency)}</div><p className="text-xs text-gray-500">Este mes</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Gastos Totales</CardTitle><ArrowDownLeft className="h-4 w-4 text-red-600"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(expense, settings.currency)}</div><p className="text-xs text-gray-500">Este mes</p></CardContent></Card>
      <Card className="md:col-span-2 lg:col-span-3"><CardHeader><CardTitle>Distribución de Gastos</CardTitle><CardDescription>Un vistazo a dónde va tu dinero por categoría.</CardDescription></CardHeader><CardContent><CategoryDonutChart/></CardContent></Card>
    </div>
  );
}
