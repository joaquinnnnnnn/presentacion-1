'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshAccessToken, fetchMe } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();

  // estado controlado como en tu login original
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Si ya hay refresh cookie válida, refrescamos token y redirigimos (igual que antes)
  useEffect(() => {
    refreshAccessToken().then(async (t) => {
      if (!t) return;
      const me = await fetchMe();
      if (me) router.replace('/dashboard'); // o '/' si prefieres
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // MUY importante para enviar/recibir refresh cookie
        body: JSON.stringify({ email, password }),
      });

      if (!r.ok) {
        setErr('Credenciales inválidas');
        return;
      }

      // igual que tu login anterior: refrescamos para obtener access_token en memoria
      await refreshAccessToken();

      // redirección como antes
      router.replace('/');
    } catch {
      setErr('Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-emerald-200">
        <div className="flex flex-col items-center mb-8">
          {/* Coloca tu logo en /public/clarifi-logo.png */}
          <Image
            src="/clarifi-logo.png"
            alt="Clarifi"
            width={96}
            height={96}
            className="mb-3"
            priority
          />
          <h1 className="text-2xl font-semibold text-emerald-800">Bienvenido a Clarifi</h1>
          <p className="text-gray-500 text-sm text-center">
            Administra tus finanzas personales fácilmente
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-1">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              required
              autoComplete="email"
              className="w-full rounded-md border border-emerald-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              placeholder="********"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-emerald-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {err ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {err}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-md shadow-sm transition-all"
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="flex justify-between mt-6 text-sm text-emerald-700">
          <a href="/register" className="hover:underline">
            Crear cuenta
          </a>
          <a href="/forgot-password" className="hover:underline">
            Olvidé mi contraseña
          </a>
        </div>
      </div>
    </div>
  );
}
