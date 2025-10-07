"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFinTrack } from '../fin-track-app';
import type { Settings } from '@/lib/types';

export default function SettingsView(){
  const { settings, updateSettings } = useFinTrack();
  const handle = (key: keyof Settings, value: string) => updateSettings({ [key]: value } as any);
  return (
    <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle>Configuración</CardTitle><CardDescription>Personaliza la aplicación a tu gusto.</CardDescription></CardHeader><CardContent className="space-y-8">
      <div className="space-y-2"><Label htmlFor="currency">Moneda</Label>
        <Select value={settings.currency} onValueChange={(v)=>handle('currency', v)}>
          <SelectTrigger id="currency" className="w-[180px]"><SelectValue placeholder="Selecciona Moneda"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="CLP">CLP ($)</SelectItem><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem><SelectItem value="JPY">JPY (¥)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="date-format">Formato de Fecha</Label>
        <Select value={settings.dateFormat} onValueChange={(v)=>handle('dateFormat', v)}>
          <SelectTrigger id="date-format" className="w-[180px]"><SelectValue placeholder="Selecciona Formato"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Tema</Label>
        <RadioGroup defaultValue={settings.theme} onValueChange={(v: 'light'|'dark') => { handle('theme', v); document.documentElement.classList.toggle('dark', v==='dark'); }} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light"/><Label htmlFor="light">Claro</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="dark" id="dark"/><Label htmlFor="dark">Oscuro</Label></div>
        </RadioGroup>
      </div>
    </CardContent></Card>
  );
}
