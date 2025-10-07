import type { Category, Transaction } from './types';
export const initialCategories: Category[] = [
  { id:'cat-1', name:'Compras', color:'#42A5F5', icon:'ShoppingCart' },
  { id:'cat-2', name:'Hogar', color:'#66BB6A', icon:'Home' },
  { id:'cat-3', name:'Transporte', color:'#FF7043', icon:'Car' },
  { id:'cat-4', name:'Comida', color:'#AB47BC', icon:'Utensils' },
  { id:'cat-5', name:'Salud', color:'#FFD54F', icon:'HeartPulse' },
  { id:'cat-6', name:'Salario', color:'#26C6DA', icon:'Banknote' },
  { id:'cat-7', name:'Trabajo', color:'#388E3C', icon:'Briefcase' },
];
export const initialTransactions: Transaction[] = [
  { id:'tx-1', description:'Supermercado', amount:75500, type:'expense', date:new Date(), categoryId:'cat-1' },
  { id:'tx-2', description:'Salario Mensual', amount:2500000, type:'income', date:new Date(), categoryId:'cat-6' },
];
