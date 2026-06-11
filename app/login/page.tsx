'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleEntryLinks } from '@/components/RoleEntryLinks';

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
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Вход в TajFix</h1>
        <p className="mt-2 text-sm text-muted-foreground">Используйте email и пароль для доступа к сервисам.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 sm:mt-8">
          <label className="block text-sm font-medium text-muted-foreground">
            Email
            <input
              type="email"
              {...register('email')}
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
          <button className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" type="submit">
            Войти
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта? <Link href="/register" className="font-semibold text-primary">Зарегистрироваться</Link>
        </p>

        <RoleEntryLinks />
      </div>
    </main>
  );
}
