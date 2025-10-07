import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]){ return twMerge(clsx(inputs)) }
export function formatCurrency(amount: number, currency: 'USD'|'EUR'|'GBP'|'JPY'|'CLP' = 'USD') {
  const locale = currency === 'CLP' ? 'es-CL' : 'en-US';
  return new Intl.NumberFormat(locale,{ style:'currency', currency, minimumFractionDigits: currency==='CLP'?0:2, maximumFractionDigits: currency==='CLP'?0:2 }).format(amount);
}
