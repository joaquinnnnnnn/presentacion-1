"use client";
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinTrack } from '../fin-track-app';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PER_PAGE = 10;
export default function TransactionsView(){
  const { transactions, categories, settings } = useFinTrack();
  const [searchTerm, setSearchTerm] = useState(''); const [typeFilter, setTypeFilter] = useState('all'); const [categoryFilter, setCategoryFilter] = useState('all'); const [page, setPage] = useState(1);
  const filtered = useMemo(()=>transactions.filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()) && (typeFilter==='all' || tx.type===typeFilter) && (categoryFilter==='all' || tx.categoryId===categoryFilter)).sort((a,b)=>b.date.getTime()-a.date.getTime()), [transactions, searchTerm, typeFilter, categoryFilter]);
  const slice = useMemo(()=>filtered.slice((page-1)*PER_PAGE, (page-1)*PER_PAGE + PER_PAGE), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const getCategory = (id: string) => categories.find(c=>c.id===id);
  return (
    <Card><CardHeader><CardTitle>Transacciones</CardTitle><CardDescription>Revisa y gestiona tus transacciones.</CardDescription></CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"/><Input type="search" placeholder="Buscar por descripción..." className="pl-8" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Tipo"/></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="income">Ingreso</SelectItem><SelectItem value="expense">Gasto</SelectItem></SelectContent></Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Categoría"/></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
      </div>
      <div className="rounded-md border">
        <Table><TableHeader><TableRow><TableHead>Descripción</TableHead><TableHead>Categoría</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Monto</TableHead></TableRow></TableHeader>
        <TableBody>{slice.length ? slice.map(tx => { const cat = getCategory(tx.categoryId); return (
          <TableRow key={tx.id}><TableCell className="font-medium">{tx.description}</TableCell>
          <TableCell>{cat && <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }}>{cat.name}</Badge>}</TableCell>
          <TableCell>{tx.date.toLocaleDateString()}</TableCell>
          <TableCell className={`text-right font-semibold ${tx.type==='income'?'text-green-600':'text-red-600'}`}>{tx.type==='income'?'+':'-'}{formatCurrency(tx.amount, settings.currency)}</TableCell></TableRow>
        )}) : (<TableRow><TableCell colSpan={4} className="h-24 text-center">No se encontraron transacciones.</TableCell></TableRow>)}</TableBody></Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
        <Button variant="outline" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><ChevronLeft className="h-4 w-4"/></Button>
        <Button variant="outline" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><ChevronRight className="h-4 w-4"/></Button>
      </div>
    </CardContent></Card>
  );
}
