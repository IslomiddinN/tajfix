'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(10, 'Введите номер телефона'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов')
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (values: RegisterValues) => {
    setError('');
    setMessage('');
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || 'Ошибка регистрации');
      return;
    }
    setMessage('Пользователь создан. Вы можете войти.');
  };

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-950">Регистрация</h1>
        <p className="mt-2 text-sm text-slate-600">Создайте аккаунт, чтобы пользоваться сервисами.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Имя
            <input
              type="text"
              {...register('name')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              {...register('email')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Телефон
            <input
              type="tel"
              {...register('phone')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Пароль
            <input
              type="password"
              {...register('password')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          <button className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            Зарегистрироваться
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Уже есть аккаунт? <Link href="/login" className="font-semibold text-sky-600">Войти</Link>
        </p>
      </div>
    </main>
  );
}
