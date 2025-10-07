"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useFinTrack } from '../fin-track-app';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({ description: z.string().min(1,'Requerido'), amount: z.coerce.number().positive('Debe ser positivo'), type: z.enum(['income','expense']), categoryId: z.string().min(1,'Requerido') });
type Values = z.infer<typeof schema>;

export default function AddTransactionModal({ isOpen, onOpenChange }: { isOpen:boolean; onOpenChange:(v:boolean)=>void }){
  const { categories, addTransaction } = useFinTrack();
  const { toast } = useToast();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { description:'', amount:0, type:'expense', categoryId:'' } });
  const onSubmit = (data: Values) => { addTransaction(data); toast({ title:'Transacción Agregada', description:`Se ha añadido "${data.description}".` }); onOpenChange(false); form.reset(); };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Agregar Transacción</DialogTitle><DialogDescription>Añade un nuevo ingreso o gasto.</DialogDescription></DialogHeader>
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="expense" /><FormLabel className="font-normal">Gasto</FormLabel></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="income" /><FormLabel className="font-normal">Ingreso</FormLabel></div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Input placeholder="Ej: Café, Salario" {...field} /></FormControl><FormMessage/></FormItem>)}/>
          <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage/></FormItem>)}/>
          <FormField control={form.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Categoría</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona categoría"/></SelectTrigger></FormControl><SelectContent>{categories.map(cat=>(<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
            <FormMessage/></FormItem>)}/>
          <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
        </form></Form>
      </DialogContent>
    </Dialog>
  );
}
