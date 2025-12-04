"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Currency = "CLP" | "USD";
type Theme = "light" | "dark";

type Settings = {
  currency: Currency;
  fxRate: number;
  theme: Theme;
};

type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  kind: "income" | "expense";
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
  categoryId?: string | null;
};

type FinTrackCtx = {
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  reload: () => Promise<void>;
};

const DEFAULT_FX = 0.00106;

const Ctx = createContext<FinTrackCtx>({} as any);

export function useFinTrack() {
  return useContext(Ctx);
}

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then(async (r) => {
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "error");
    return j;
  });
}

function AppShell() {
  const [tab, setTab] =
    useState<"resumen" | "transacciones" | "categorias" | "reportes" | "config">("resumen");

  // vistas
  const ResumenView      = require("./views/dashboard-view").default ?? (() => null);
  const TransactionsView = require("./views/transactions-view").default ?? (() => null);
  const CategoriesView   = require("./views/categories-view").default ?? (() => null);
  const ReportsView      = require("./views/reports-view").default ?? (() => null);
  const SettingsView     = require("./views/settings-view").default ?? (() => null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <span className="font-semibold">Clarifi</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("resumen")}
              className={`rounded px-3 py-2 text-sm ${
                tab === "resumen"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Resumen
            </button>
            <button
              type="button"
              onClick={() => setTab("transacciones")}
              className={`rounded px-3 py-2 text-sm ${
                tab === "transacciones"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Transacciones
            </button>
            <button
              type="button"
              onClick={() => setTab("categorias")}
              className={`rounded px-3 py-2 text-sm ${
                tab === "categorias"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setTab("reportes")}
              className={`rounded px-3 py-2 text-sm ${
                tab === "reportes"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Reportes
            </button>
            <button
              type="button"
              onClick={() => setTab("config")}
              className={`rounded px-3 py-2 text-sm ${
                tab === "config"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Configuración
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-4 pb-8">
        {tab === "resumen"       && <ResumenView />}
        {tab === "transacciones" && <TransactionsView />}
        {tab === "categorias"    && <CategoriesView />}
        {tab === "reportes"      && <ReportsView />}
        {tab === "config"        && <SettingsView />}
      </main>
    </div>
  );
}

export function FinTrackProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("clarifi_settings");
      if (raw) return JSON.parse(raw);
    }
    return { currency: "CLP", fxRate: DEFAULT_FX, theme: "light" };
  });

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  useEffect(() => {
    localStorage.setItem("clarifi_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.theme]);

  async function reload() {
    const [cats, txs] = await Promise.all([
      fetchJSON<Category[]>("/api/categories"),
      fetchJSON<any[]>("/api/transactions"),
    ]);
    setCategories(cats);
    const mapped: Transaction[] = txs.map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: new Date(t.date),
      type: t.type,
      categoryId: t.categoryId ?? null,
    }));
    setTransactions(mapped);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ transactions, categories, settings, updateSettings, reload }),
    [transactions, categories, settings]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export default function FinTrackApp() {
  return (
    <FinTrackProvider>
      <AppShell />
    </FinTrackProvider>
  );
}
