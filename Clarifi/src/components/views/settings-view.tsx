"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/client-auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFinTrack } from "../fin-track-app";

export default function SettingsView() {
  const router = useRouter();
  const { settings, updateSettings } = useFinTrack();
  const [fx, setFx] = useState(String(settings.fxRate));

  const saveFx = () => {
    const n = Number(fx);
    if (!Number.isFinite(n) || n <= 0) return;
    updateSettings({ fxRate: n });
  };

  async function handleLogout() {
    try {
      await logout();                 // limpia accessToken y hace POST /api/auth/logout
      router.replace("/login");
    } catch {
      // si fallara el fetch, forzamos navegación igual
      window.location.href = "/login";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
        <CardDescription>Personaliza la aplicación a tu gusto.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Moneda */}
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select 
            value={settings.currency}
            onValueChange={(v: "CLP" | "USD") => updateSettings({ currency: v })}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLP">CLP ($)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
            </SelectContent>
          </Select>

        {/* Tasa (opcional cuando se usa USD) */}
          {settings.currency === "USD" && (
            <div className="flex items-center gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-sm">Tasa USD por CLP</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-[160px]"
                    value={fx}
                    onChange={(e) => setFx(e.target.value)}
                    placeholder="0.00106"
                  />
                  <Button onClick={saveFx}>Guardar tasa</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ej: 1000 CLP ≈ 1.06 USD → tasa = 0.00106
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="h-px bg-muted" />

        {/* Cerrar sesión */}
        <div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4"
          >
            Cerrar sesión
          </Button>
        </div>
      </CardContent>
    </Card>

  );
}
