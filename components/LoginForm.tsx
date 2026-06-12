'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RoleEntryLinks } from '@/components/RoleEntryLinks';
import { appHref } from '@/lib/appUrls';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов')
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  /** Where to send the user after login when there is no ?callbackUrl= in the URL. */
  fallbackCallback?: string;
  title?: string;
  subtitle?: string;
  /** Show the "войти как продавец/мастер" role links (client site only). */
  showRoleLinks?: boolean;
  /** Show the "Зарегистрироваться" link to this app's own /register page. */
  showRegister?: boolean;
  /** Show a "← На сайт TajFix" link back to the public site (sub-apps). */
  backToSite?: boolean;
}

/**
 * Shared credentials login form. Each app in the monorepo serves its own
 * /login (sessions are per-domain), but they all reuse this component and only
 * differ in where they send the user afterwards.
 */
export function LoginForm({
  fallbackCallback = '/',
  title = 'Вход в TajFix',
  subtitle = 'Используйте email и пароль для доступа к сервисам.',
  showRoleLinks = false,
  showRegister = false,
  backToSite = false
}: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<LoginValues>({
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
    const target = params.get('callbackUrl') || fallbackCallback;
    router.push(target);
    router.refresh();
  };

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

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
          <button
            className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            type="submit"
          >
            Войти
          </button>
        </form>

        {showRegister ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link href="/register" className="font-semibold text-primary">
              Зарегистрироваться
            </Link>
          </p>
        ) : null}

        {showRoleLinks ? <RoleEntryLinks /> : null}

        {backToSite ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <a href={appHref('client', '/')} className="font-semibold text-primary">
              ← На сайт TajFix
            </a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
