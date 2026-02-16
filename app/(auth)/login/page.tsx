'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_KEY, FIXED_PASSWORD, FIXED_USER } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email === FIXED_USER && password === FIXED_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'ok');
      router.push('/dashboard');
      return;
    }

    setError('Credenciales inválidas. Verifique usuario y contraseña.');
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Ingreso al sistema</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Gestión de préstamos y nómina</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Correo</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-500 py-2 font-semibold text-white transition hover:bg-brand-600"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
