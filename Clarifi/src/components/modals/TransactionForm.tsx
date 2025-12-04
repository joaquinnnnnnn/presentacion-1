"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Category = { id: string; name: string; kind: "income" | "expense" };

type FormValues = {
  description: string;
  amount: number;
  date: string; // siempre string YYYY-MM-DD
  type: "income" | "expense";
  categoryId: string | "";
};

// YYYY-MM-DD en hora local (sin toISOString)
function todayLocalYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function TransactionForm({ onSaved }: { onSaved?: () => void }) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      description: "",
      amount: 0,
      date: todayLocalYMD(), // ✅ local, no UTC
      type: "expense",
      categoryId: ""
    }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const type = watch("type");
  const categoryId = watch("categoryId");

  useEffect(() => {
    // fetch autenticado: tu parche global añade Authorization
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  // Si cambia el tipo, limpia categoría si no coincide
  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat && cat.kind !== type) {
      setValue("categoryId", "");
    }
  }, [type, categoryId, categories, setValue]);

  const onSubmit = async (v: FormValues) => {
    // Asegurar que la fecha ya es string YYYY-MM-DD (viene de <input type="date">)
    const payload = {
      description: String(v.description ?? "").trim(),
      amount: Number(v.amount), // el backend ya hace abs+round
      date: String(v.date),     // ✅ NO new Date().toISOString()
      type: v.type,
      categoryId: v.categoryId || null
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Authorization lo agrega el parche
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // reset conservando type y poniendo fecha de hoy
      const keepType = v.type;
      reset({
        description: "",
        amount: 0,
        date: todayLocalYMD(),
        type: keepType,
        categoryId: ""
      });
      onSaved?.();
    } else {
      const j = await res.json().catch(() => ({} as any));
      alert(j?.error || "Error al crear la transacción");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm">Descripción</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Ej: Café"
          {...register("description", { required: true })}
        />
      </div>

      <div>
        <label className="text-sm">Monto (CLP)</label>
        <input
          type="number"
          step="1"
          className="w-full border rounded px-3 py-2"
          placeholder="Ej: 2000"
          {...register("amount", { valueAsNumber: true, required: true, min: 1 })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="income" {...register("type")} /> Ingreso
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="expense" {...register("type")} /> Gasto
        </label>
      </div>

      <div>
        <label className="text-sm">Fecha</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          {...register("date", { required: true })}
        />
      </div>

      <div>
        <label className="text-sm">Categoría</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={categoryId}
          onChange={(e) => setValue("categoryId", e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categories
            .filter(c => c.kind === type)
            .map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded px-4 py-2 bg-emerald-600 text-white"
      >
        Guardar
      </button>
    </form>
  );
}
