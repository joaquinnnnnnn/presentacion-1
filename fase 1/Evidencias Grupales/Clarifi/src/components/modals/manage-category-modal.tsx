"use client";
import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as LucideIcons from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinTrack } from '../fin-track-app';
import type { Category } from '@/lib/types';

const schema = z.object({ name: z.string().min(1,'Requerido'), color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/,'HEX válido'), icon: z.string().min(1,'Requerido') });
type FormValues = z.infer<typeof schema>;
export default function ManageCategoryModal({ isOpen, onOpenChange, category }: { isOpen:boolean; onOpenChange:(v:boolean)=>void; category?: Category; }){
  const { addCategory, updateCategory } = useFinTrack();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: category?.name || '', color: category?.color || '#42A5F5', icon: category?.icon || 'Folder' } });
  useEffect(() => { form.reset({ name: category?.name || '', color: category?.color || '#42A5F5', icon: category?.icon || 'Folder' }); }, [category]);
  const submit = (data: FormValues) => { if(category) updateCategory({ ...category, ...data }); else addCategory({ ...data }); onOpenChange(false); };
  const iconOptions = ['ShoppingCart','Home','Car','Utensils','HeartPulse','Banknote','Briefcase','Folder','Wallet','PiggyBank','CreditCard'];
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-[480px]"><DialogHeader><DialogTitle>{category ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle><DialogDescription>Define nombre, color e ícono.</DialogDescription></DialogHeader>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <div className="space-y-2"><Label>Nombre</Label><Input {...form.register('name')} placeholder="Ej: Transporte"/>{form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}</div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2"><Label>Color (HEX)</Label><Input {...form.register('color')} placeholder="#42A5F5"/>{form.formState.errors.color && <p className="text-sm text-red-600">{form.formState.errors.color.message}</p>}</div>
          <div className="flex-1 space-y-2"><Label>Ícono</Label>
            <Select value={form.watch('icon')} onValueChange={(v)=>form.setValue('icon', v)}>
              <SelectTrigger><SelectValue placeholder="Ícono"/></SelectTrigger>
              <SelectContent>{iconOptions.map(n=>(<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent>
            </Select>
            {form.formState.errors.icon && <p className="text-sm text-red-600">{form.formState.errors.icon.message}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Label>Preview</Label>
          <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: form.watch('color') + '20' }}>
            {(() => { const Icon = (LucideIcons as any)[form.watch('icon')] || LucideIcons.Folder; return <Icon className="h-5 w-5" style={{ color: form.watch('color') }} />; })()}
            <span className="text-sm">{form.watch('name') || 'Categoría'}</span>
          </div>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button><Button type="submit">{category ? 'Guardar Cambios' : 'Crear Categoría'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}
