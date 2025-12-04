"use client";
import { useState } from "react";
import { useFinTrack } from "../fin-track-app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ManageCategoryModal from "@/components/modals/manage-category-modal";
import { Pencil, Trash2, Plus } from "lucide-react";
import * as Lucide from "lucide-react";

type Cat = {
  id: string;
  name: string;
  color?: string;
  icon?: string; // nombre del ícono en lucide-react, ej: "ShoppingCart", "Home", etc.
  kind: "income" | "expense";
};

function CategoryAvatar({ name, color, icon }: { name: string; color?: string; icon?: string }) {
  const IconCmp =
    icon && (Lucide as any)[icon as keyof typeof Lucide]
      ? (Lucide as any)[icon as keyof typeof Lucide]
      : null;

  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color || "#93c5fd" }}
      title={icon || name}
    >
      {IconCmp ? <IconCmp className="h-5 w-5" /> : (name?.[0] || "?")}
    </span>
  );
}

export default function CategoriesView() {
  const { categories, reload } = useFinTrack();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);

  async function removeCategory(id: string) {
    const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!r.ok) return;
    await reload();
  }

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(cat: Cat) {
    setEditing(cat);
    setOpen(true);
  }

  async function onSaved() {
    setOpen(false);
    setEditing(null);
    await reload();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Categorías</h2>
          <p className="text-sm text-muted-foreground">Organiza tus gastos e ingresos.</p>
        </div>
        <Button onClick={onAdd} className="bg-green-700 hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <CategoryAvatar name={c.name} color={c.color} icon={c.icon} />
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {c.kind === "income" ? "Ingreso" : "Gasto"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(c)}
                  className="text-gray-700 hover:text-black"
                  aria-label="Editar categoría"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeCategory(c.id)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Eliminar categoría"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>

      {open && (
        <ManageCategoryModal
          isOpen={open}
          onOpenChange={setOpen}
          /* ⬇️ si tu modal NO usa "category" y sí "editingCategory", cambia esta línea: */
          category={editing as any}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
