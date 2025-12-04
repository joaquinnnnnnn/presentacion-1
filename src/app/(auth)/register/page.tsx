'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (r.status === 201) {
        setMsg('✅ Cuenta creada. Redirigiendo al inicio de sesión...');
        setTimeout(() => router.replace('/login'), 1200);
      } else if (r.status === 409) {
        setMsg('⚠️ Ese correo ya está en uso.');
      } else {
        setMsg('❌ Error al registrar.');
      }
    } catch {
      setMsg('❌ Error de conexión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100 relative">
      {/* Flecha para volver */}
      <button
        onClick={() => router.push('/login')}
        className="absolute top-6 left-6 flex items-center text-emerald-700 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium">Volver</span>
      </button>

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-emerald-200">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/clarifi-logo.png"
            alt="Clarifi logo"
            width={96}
            height={96}
            className="mb-3"
            priority
          />
          <h1 className="text-2xl font-semibold text-emerald-800">
            Crear cuenta
          </h1>
          <p className="text-gray-500 text-sm text-center">
            Únete a Clarifi y empieza a gestionar tus finanzas fácilmente.
          </p>
        </div>

        {/* FORM */}
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
              className="w-full rounded-md border border-emerald-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-md shadow-sm transition-all"
          >
            {loading ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>

        {msg ? (
          <p className="mt-4 text-sm text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md py-2">
            {msg}
          </p>
        ) : null}

        <div className="mt-6 text-center text-sm text-emerald-700">
          <a href="/login" className="hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}
