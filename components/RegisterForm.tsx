'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { appHref } from '@/lib/appUrls';

/** Дополнительное поле, специфичное для роли (название магазина, специализация, код и т.д.). */
export interface ExtraField {
  name: string;
  label: string;
  type?: 'text' | 'tel' | 'url' | 'number' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

interface RegisterFormProps {
  /** Куда отправлять POST с данными регистрации, например '/api/seller/register'. */
  endpoint: string;
  /** Куда вести после успешной регистрации и авто-входа, например '/seller'. */
  cabinetPath: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  submitLabel: string;
  extraFields?: ExtraField[];
}

const inputClass =
  'mt-2 w-full rounded-3xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

/**
 * Общая форма регистрации «нового аккаунта с нуля». Каждое приложение монорепо
 * подаёт свой endpoint, путь кабинета и роль-специфичные поля. После успешного
 * создания аккаунта форма сразу выполняет вход (signIn) и открывает кабинет —
 * «зарегистрировался → попал в кабинет».
 */
export function RegisterForm({
  endpoint,
  cabinetPath,
  title,
  subtitle,
  icon: Icon,
  submitLabel,
  extraFields = []
}: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Record<string, string>>();

  const onSubmit = async (values: Record<string, string>) => {
    setError('');
    setSubmitting(true);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Не удалось зарегистрироваться');
      setSubmitting(false);
      return;
    }
    // Аккаунт создан — сразу входим им и открываем кабинет.
    const signed = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });
    if (signed?.error) {
      // Создан, но авто-вход не удался — отправляем на страницу входа.
      router.push(`/login?callbackUrl=${encodeURIComponent(cabinetPath)}`);
      return;
    }
    router.push(cabinetPath);
    router.refresh();
  };

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-muted-foreground">
            Имя
            <input type="text" {...register('name', { required: 'Введите имя' })} className={inputClass} />
            {errors.name ? <span className="mt-1 block text-xs text-red-600">{String(errors.name.message)}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Email
            <input type="email" {...register('email', { required: 'Введите email' })} className={inputClass} />
            {errors.email ? <span className="mt-1 block text-xs text-red-600">{String(errors.email.message)}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Телефон
            <input type="tel" {...register('phone', { required: 'Введите телефон' })} className={inputClass} />
            {errors.phone ? <span className="mt-1 block text-xs text-red-600">{String(errors.phone.message)}</span> : null}
          </label>
          <label className="block text-sm font-medium text-muted-foreground">
            Пароль
            <input
              type="password"
              {...register('password', {
                required: 'Введите пароль',
                minLength: { value: 6, message: 'Минимум 6 символов' }
              })}
              className={inputClass}
            />
            {errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{String(errors.password.message)}</span>
            ) : null}
          </label>

          {extraFields.map((field) => (
            <label key={field.name} className="block text-sm font-medium text-muted-foreground">
              {field.label}
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  {...register(field.name, field.required ? { required: 'Заполните поле' } : {})}
                  className={inputClass}
                />
              ) : (
                <input
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  {...register(field.name, field.required ? { required: 'Заполните поле' } : {})}
                  className={inputClass}
                />
              )}
              {errors[field.name] ? (
                <span className="mt-1 block text-xs text-red-600">{String(errors[field.name]?.message)}</span>
              ) : null}
            </label>
          ))}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            disabled={submitting}
            type="submit"
            className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Создание…' : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href={`/login?callbackUrl=${encodeURIComponent(cabinetPath)}`} className="font-semibold text-primary">
            Войти
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          <a href={appHref('client', '/')} className="font-semibold text-primary">
            ← На сайт TajFix
          </a>
        </p>
      </div>
    </main>
  );
}
