"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MonthlyReportChart } from '../charts/monthly-report-chart';
export default function ReportsView(){
  return (<div className="grid gap-4"><Card><CardHeader><CardTitle>Reporte Mensual</CardTitle><CardDescription>Comparativa de ingresos y gastos del mes actual.</CardDescription></CardHeader><CardContent><MonthlyReportChart/></CardContent></Card></div>);
}
