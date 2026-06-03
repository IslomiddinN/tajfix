'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return <EmptyState title="Не авторизован" description="Войдите, чтобы просмотреть профиль и историю заказов." />;
  }

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
          <h1 className="text-3xl font-semibold text-slate-950">Профиль</h1>
          <div className="mt-6 space-y-4 text-slate-700">
            <div>
              <p className="text-sm text-slate-500">Имя</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{profile?.name ?? session.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{profile?.email ?? session.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Телефон</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{profile?.phone ?? 'Не указан'}</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="mt-8 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Выйти
          </button>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-950">Адреса</h2>
          <p className="mt-3 text-slate-600">Добавляйте адреса в следующий релиз приложения.</p>
        </section>
      </div>
    </main>
  );
}
