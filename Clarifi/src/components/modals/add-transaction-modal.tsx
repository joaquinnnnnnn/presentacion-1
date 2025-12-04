"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFinTrack } from "../fin-track-app";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTransactionModal({ isOpen, onOpenChange }: Props) {
  const { categories } = useFinTrack();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string | "none">("none");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!description.trim()) return false;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return false;
    return true;
  }, [description, amount]);

  async function onSubmit() {
    setError(null);
    if (!canSubmit) {
      setError("Complete los campos correctamente.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        description: description.trim(),
        amount: Number(amount),
        type,
        date,
        categoryId: categoryId === "none" ? null : categoryId,
      };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Error al crear transacción");
      }
      onOpenChange(false);
      window.location.reload();
    } catch (e: any) {
      setError(e.message || "Error al crear transacción");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Agregar transacción</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Café" />
          </div>

          <div className="grid gap-2">
            <Label>Monto (CLP)</Label>
            <Input type="number" inputMode="numeric" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 2000" />
          </div>

          <div className="grid gap-2">
            <Label>Tipo</Label>
            <RadioGroup className="flex gap-6" value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="t-inc" value="income" />
                <Label htmlFor="t-inc">Ingreso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="t-exp" value="expense" />
                <Label htmlFor="t-exp">Gasto</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {categories
                  .filter((c: any) => c.kind === type)
                  .map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={!canSubmit || submitting}>{submitting ? "Guardando..." : "Guardar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
