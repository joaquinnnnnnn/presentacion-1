"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Banknote,
  Briefcase,
  Folder,
  Wallet,
  PiggyBank,
  CreditCard,
} from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // valor inicial (por si quieres abrirlo ya como ingreso/gasto),
  // pero ahora el usuario lo puede cambiar dentro del modal
  defaultKind?: "income" | "expense";
};

const ICONS = {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  HeartPulse,
  Banknote,
  Briefcase,
  Folder,
  Wallet,
  PiggyBank,
  CreditCard,
};

const ICON_OPTIONS = [
  { value: "ShoppingCart", label: "Carrito" },
  { value: "Home", label: "Casa" },
  { value: "Car", label: "Auto" },
  { value: "Utensils", label: "Comida" },
  { value: "HeartPulse", label: "Salud" },
  { value: "Banknote", label: "Billete" },
  { value: "Briefcase", label: "Trabajo" },
  { value: "Folder", label: "Carpeta" },
  { value: "Wallet", label: "Billetera" },
  { value: "PiggyBank", label: "Ahorro" },
  { value: "CreditCard", label: "Tarjeta" },
];

const SWATCHES = [
  "#F43F5E",
  "#F59E0B",
  "#84CC16",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#94A3B8",
  "#111827",
];

export default function CreateCategoryModal({
  isOpen,
  onOpenChange,
  defaultKind = "expense",
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#42A5F5");
  const [icon, setIcon] = useState<string>("Folder");
  const [kind, setKind] = useState<"income" | "expense">(defaultKind);
  const [submitting, setSubmitting] = useState(false);

  const IconPreview = ICONS[icon as keyof typeof ICONS];

  async function onSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
          icon,
          kind, // 👉 ahora se envía el tipo elegido por el usuario
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Error al crear categoría");
      }
      onOpenChange(false);
      // si quieres puedes seguir recargando la página
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Nombre */}
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej: Transporte"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Tipo: Ingreso / Gasto */}
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <RadioGroup
              className="flex gap-6"
              value={kind}
              onValueChange={(v: "income" | "expense") => setKind(v)}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem id="cat-expense" value="expense" />
                <span>Gasto</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem id="cat-income" value="income" />
                <span>Ingreso</span>
              </label>
            </RadioGroup>
          </div>

          {/* Color */}
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-2 ${
                    color === c ? "ring-emerald-600" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                  title={c}
                />
              ))}
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-12 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28"
                />
              </div>
            </div>
          </div>

          {/* Ícono */}
          <div className="grid gap-2">
            <Label>Ícono</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona ícono" />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vista previa */}
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color, opacity: 0.15 }}
            />
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color, opacity: 0.15 }}
              >
                <IconPreview style={{ color }} />
              </div>
              <span className="text-sm text-gray-600">Vista previa</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              disabled={submitting || !name.trim()}
            >
              Crear Categoría
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
