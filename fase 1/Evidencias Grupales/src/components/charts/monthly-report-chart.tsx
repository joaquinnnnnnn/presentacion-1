"use client";
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useFinTrack } from '../fin-track-app';
import { formatCurrency } from '@/lib/utils';

export function MonthlyReportChart(){
  const { transactions, settings } = useFinTrack();
  const data = useMemo(() => {
    const today = new Date();
    const daily: Record<string,{income:number;expense:number}> = {};
    for(let i=29;i>=0;i--){
      const d = new Date(today); d.setDate(today.getDate()-i);
      const key = d.toLocaleDateString('en-CA');
      daily[key] = { income:0, expense:0 };
    }
    transactions.forEach(t => {
      const key = t.date.toLocaleDateString('en-CA');
      if(daily[key]) daily[key][t.type]+=t.amount;
    });
    return Object.entries(daily).map(([k,v])=>({ date:new Date(k).toLocaleDateString('es-ES',{ month:'short', day:'numeric'}), ...v }));
  }, [transactions]);
  return (
    <ChartContainer className="min-h-[400px] w-full">
      <BarChart data={data}><CartesianGrid vertical={false}/>
        <XAxis dataKey="date"/><YAxis tickFormatter={(v)=>formatCurrency(v as number, settings.currency)} />
        <Tooltip content={<ChartTooltipContent/>}/><Legend/>
        <Bar dataKey="income" fill="hsl(122 46% 44%)" radius={4} />
        <Bar dataKey="expense" fill="hsl(0 72% 51%)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
