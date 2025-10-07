import * as LucideIcons from 'lucide-react';
export type IconName = keyof typeof LucideIcons;
export interface Category { id: string; name: string; color: string; icon: IconName; }
export interface Transaction { id: string; description: string; amount: number; type: 'income'|'expense'; date: Date; categoryId: string; }
export interface Settings { currency: 'USD'|'EUR'|'GBP'|'JPY'|'CLP'; dateFormat: 'MM/DD/YYYY'|'DD/MM/YYYY'|'YYYY-MM-DD'; theme: 'light'|'dark'; }
