"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-emerald-100/80 p-8">
          <p className="text-center text-sm text-red-600">
            Enlace inválido o incompleto. Vuelve a solicitar la recuperación de
            contraseña.
          </p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-6 w-full rounded-lg border border-emerald-600 text-emerald-700 py-2.5 text-sm font-medium hover:bg-emerald-50 transition"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!r.ok) {
        setError("Token inválido o vencido. Vuelve a solicitar el enlace.");
        return;
      }

      setSuccess(
        "Contraseña actualizada correctamente. Redirigiendo al login..."
      );
      setTimeout(() => router.replace("/login"), 1500);
    } catch {
      setError("Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-emerald-100/80 p-8">
        <div className="flex justify-center mb-4">
          <img src="/clarifi-logo.png" alt="Clarifi" className="h-12 w-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-center text-emerald-800 mb-1">
          Nueva contraseña
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Ingresa una nueva contraseña para tu cuenta.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-emerald-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-emerald-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
              <span>✕</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 flex items-center gap-2">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

        <button
          onClick={() => router.replace("/login")}
          className="mt-4 w-full text-center text-xs text-emerald-700 hover:underline"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
