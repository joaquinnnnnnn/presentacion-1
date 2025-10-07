"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinTrack } from '../fin-track-app';
import { Edit, PlusCircle, Trash } from 'lucide-react';
import type { Category } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

interface Props { onEditCategory: (category?: Category)=>void }
export default function CategoriesView({ onEditCategory }: Props){
  const { categories, deleteCategory } = useFinTrack();
  return (
    <Card><CardHeader><div className="flex justify-between items-center"><div><CardTitle>Categorías</CardTitle><CardDescription>Organiza tus gastos e ingresos.</CardDescription></div><Button onClick={()=>onEditCategory()}><PlusCircle className="mr-2 h-4 w-4" />Agregar Categoría</Button></div></CardHeader>
    <CardContent><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map(cat => { const Icon = (LucideIcons as any)[cat.icon] as any; return (
        <div key={cat.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>{Icon && <Icon className="h-6 w-6" style={{ color: cat.color }} />}</div>
            <span className="font-medium">{cat.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={()=>onEditCategory(cat)}><Edit className="h-4 w-4"/></Button>
            <Button variant="ghost" onClick={()=>deleteCategory(cat.id)}><Trash className="h-4 w-4 text-red-600"/></Button>
          </div>
        </div>
      )})}
    </div></CardContent></Card>
  );
}
