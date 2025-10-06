"use client";
import { useMemo } from 'react';
import { Pie, PieChart, Tooltip, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useFinTrack } from '../fin-track-app';
import { formatCurrency } from '@/lib/utils';

export function CategoryDonutChart(){
  const { transactions, categories, settings } = useFinTrack();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type==='expense').forEach(t => map.set(t.categoryId, (map.get(t.categoryId)||0)+t.amount));
    return Array.from(map.entries()).map(([id, amount]) => {
      const cat = categories.find(c => c.id===id);
      return { name: cat?.name || 'Sin categoría', amount, fill: cat?.color || '#8884d8' };
    });
  }, [transactions, categories]);
  if (!data.length) return <div className="h-80 flex items-center justify-center text-gray-500">No hay gastos para mostrar.</div>;
  return (
    <ChartContainer className="mx-auto aspect-square max-h-[400px]">
      <PieChart>
        <Tooltip content={<ChartTooltipContent />} />
        <Pie data={data} dataKey="amount" nameKey="name" innerRadius={100} strokeWidth={4}>
          {data.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
        </Pie>
        <Legend />
      </PieChart>
    </ChartContainer>
  );
}
