'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов')
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginValues) => {
    setError('');
    const response = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });
    if (response?.error) {
      setError('Неверный логин или пароль');
      return;
    }
    router.push('/');
  };

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-950">Вход в TajFix</h1>
        <p className="mt-2 text-sm text-slate-600">Используйте email и пароль для доступа к сервисам.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              {...register('email')}
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
          <button className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            Войти
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Нет аккаунта? <Link href="/register" className="font-semibold text-sky-600">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
}
