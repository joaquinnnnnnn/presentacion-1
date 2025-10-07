"use client";
import * as React from 'react';
import { ResponsiveContainer, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>;

export function ChartContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full h-full', className)}>
      <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
    </div>
  );
}

export function ChartTooltipContent(props: any){
  // Let Recharts render its default tooltip content; this is a stub to satisfy imports.
  return null;
}
