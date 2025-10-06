"use client";

import type { Category, Settings, Transaction } from '@/lib/types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialCategories, initialTransactions } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DashboardView from './views/dashboard-view';
import TransactionsView from './views/transactions-view';
import CategoriesView from './views/categories-view';
import ReportsView from './views/reports-view';
import SettingsView from './views/settings-view';
import AddTransactionModal from './modals/add-transaction-modal';
import ManageCategoryModal from './modals/manage-category-modal';
import { PieChart, Plus, LayoutDashboard, List, Shapes, LineChart, Settings as SettingsIcon } from 'lucide-react';

interface FinTrackContextType {
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const FinTrackContext = createContext<FinTrackContextType | null>(null);
export const useFinTrack = () => { const ctx = useContext(FinTrackContext); if(!ctx) throw new Error('useFinTrack must be used within a FinTrackProvider'); return ctx; };

export function FinTrackApp() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [settings, setSettings] = useState<Settings>({ currency:'CLP', dateFormat:'DD/MM/YYYY', theme:'light' });

  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleOpenCategoryModal = useCallback((category?: Category) => { setEditingCategory(category); setCategoryModalOpen(true); }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => [...prev, { ...tx, id: crypto.randomUUID(), date: new Date() }]);
  }, []);
  const updateTransaction = useCallback((updated: Transaction) => { setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)); }, []);
  const deleteTransaction = useCallback((id: string) => { setTransactions(prev => prev.filter(t => t.id !== id)); }, []);

  const addCategory = useCallback((cat: Omit<Category,'id'>) => { setCategories(prev => [...prev, { ...cat, id: crypto.randomUUID() }]); }, []);
  const updateCategory = useCallback((cat: Category) => { setCategories(prev => prev.map(c => c.id === cat.id ? cat : c)); }, []);
  const deleteCategory = useCallback((id: string) => { setCategories(prev => prev.filter(c => c.id !== id)); }, []);

  const updateSettings = useCallback((s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s })), []);

  const contextValue = useMemo(() => ({ transactions, categories, settings, addTransaction, updateTransaction, deleteTransaction, addCategory, updateCategory, deleteCategory, updateSettings }), [transactions, categories, settings, addTransaction, updateTransaction, deleteTransaction, addCategory, updateCategory, deleteCategory, updateSettings]);

  return (
    <FinTrackContext.Provider value={contextValue}>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6">
          <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold text-white md:text-base">
              <PieChart className="h-6 w-6" />
              <span className="text-xl">Clarifi</span>
            </a>
          </nav>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <Tabs defaultValue="dashboard" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4 h-auto flex-wrap">
              <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2"/>Resumen</TabsTrigger>
              <TabsTrigger value="transactions"><List className="mr-2"/>Transacciones</TabsTrigger>
              <TabsTrigger value="categories"><Shapes className="mr-2"/>Categorías</TabsTrigger>
              <TabsTrigger value="reports"><LineChart className="mr-2"/>Reportes</TabsTrigger>
              <TabsTrigger value="settings"><SettingsIcon className="mr-2"/>Configuración</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard"><DashboardView/></TabsContent>
            <TabsContent value="transactions"><TransactionsView/></TabsContent>
            <TabsContent value="categories"><CategoriesView onEditCategory={handleOpenCategoryModal}/></TabsContent>
            <TabsContent value="reports"><ReportsView/></TabsContent>
            <TabsContent value="settings"><SettingsView/></TabsContent>
          </Tabs>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setTransactionModalOpen(true)} className="rounded-full h-16 w-16 shadow-lg bg-accent hover:bg-yellow-400 text-black">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Agregar Transacción</span>
        </Button>
      </div>

      <AddTransactionModal isOpen={isTransactionModalOpen} onOpenChange={setTransactionModalOpen}/>
      <ManageCategoryModal isOpen={isCategoryModalOpen} onOpenChange={setCategoryModalOpen} category={editingCategory}/>
    </FinTrackContext.Provider>
  );
}
