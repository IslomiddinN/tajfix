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
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Регистрация</h1>
        <p className="mt-2 text-sm text-muted-foreground">Создайте аккаунт, чтобы пользоваться сервисами.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 sm:mt-8">
          <label className="block text-sm font-medium text-muted-foreground">
            Имя
            <input
              type="text"
              {...register('name')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Email
            <input
              type="email"
              {...register('email')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Телефон
            <input
              type="tel"
              {...register('phone')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Пароль
            <input
              type="password"
              {...register('password')}
              className="mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <button className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" type="submit">
            Зарегистрироваться
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт? <Link href="/login" className="font-semibold text-primary">Войти</Link>
        </p>
      </div>
    </main>
  );
}
