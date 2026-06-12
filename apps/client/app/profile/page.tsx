'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  ChevronRight,
  ClipboardList,
  Headset,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Pencil,
  Plus,
  Star,
  Store,
  Trash2,
  Wrench
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { appHref } from '@/lib/appUrls';

type Role = 'USER' | 'ADMIN' | 'MASTER' | 'SELLER';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  stats: { orders: number; bookings: number; reviews: number };
  addresses: Address[];
}

const ROLE_LABEL: Record<Role, string> = {
  USER: 'Клиент',
  ADMIN: 'Администратор',
  MASTER: 'Мастер',
  SELLER: 'Продавец'
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [addrEdit, setAddrEdit] = useState<Address | 'new' | null>(null);

  const load = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) setProfile(await res.json());
  };

  useEffect(() => {
    if (status === 'authenticated') {
      load().finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading) return <LoadingSpinner />;

  if (!session || !profile) {
    return <EmptyState title="Не авторизован" description="Войдите, чтобы просмотреть профиль и историю заказов." />;
  }

  const role = profile.role;
  const initials = profile.name.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <main className="container py-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Шапка профиля */}
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold text-foreground">{profile.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {ROLE_LABEL[role]}
                </span>
                <span className="text-xs text-muted-foreground">С нами с {fmtDate(profile.createdAt)}</span>
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
            >
              <Pencil className="h-3.5 w-3.5" /> Изменить
            </button>
          </div>

          {/* Статистика активности */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat icon={ClipboardList} label="Заказов" value={profile.stats.orders} />
            <Stat icon={Wrench} label="Заявок" value={profile.stats.bookings} />
            <Stat icon={Star} label="Отзывов" value={profile.stats.reviews} />
          </div>
        </section>

        {/* Данные аккаунта */}
        <section className="rounded-[28px] border border-border bg-card p-2 shadow-card sm:rounded-[32px]">
          <Row label="Имя" value={profile.name} />
          <Row label="Email" value={profile.email} />
          <Row label="Телефон" value={profile.phone} />
          <button
            onClick={() => setPwdOpen(true)}
            className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left transition hover:bg-secondary"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <KeyRound className="h-4 w-4 text-muted-foreground" /> Сменить пароль
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        {/* Адреса доставки */}
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-card sm:rounded-[32px] sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Адреса доставки</h2>
            <button
              onClick={() => setAddrEdit('new')}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
            >
              <Plus className="h-3.5 w-3.5" /> Добавить
            </button>
          </div>
          {profile.addresses.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Пока нет адресов. Добавьте, чтобы быстрее оформлять заказы.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {profile.addresses.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/50 p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {a.label ? <span className="text-sm font-semibold text-foreground">{a.label}</span> : null}
                      {a.isDefault ? (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-500">
                          По умолчанию
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 break-words text-sm text-muted-foreground">{a.address}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setAddrEdit(a)} aria-label="Изменить" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-card">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/profile/addresses/${a.id}`, { method: 'DELETE' });
                        load();
                      }}
                      aria-label="Удалить"
                      className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Вход в рабочий кабинет по роли */}
        {role === 'SELLER' ? (
          <CabinetLink href={appHref('seller', '/seller')} icon={Store} title="Кабинет продавца" subtitle="Товары, продажи, финансы и профиль магазина" />
        ) : null}
        {role === 'MASTER' ? (
          <CabinetLink href={appHref('master', '/master')} icon={Wrench} title="Кабинет мастера" subtitle="Заявки, финансы, рейтинг и профиль" />
        ) : null}
        {role === 'ADMIN' ? (
          <CabinetLink href={appHref('admin', '/admin')} icon={LayoutDashboard} title="Админ-панель" subtitle="Товары, услуги, заказы, поддержка" />
        ) : null}
        {role === 'USER' ? (
          <CabinetLink href={appHref('seller', '/register')} icon={Store} title="Стать продавцом" subtitle="Откройте свой магазин на TajFix" />
        ) : null}

        <CabinetLink href="/support" icon={Headset} title="Поддержка" subtitle="Напишите нам — поможем с заказом, ремонтом или товаром" />

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full rounded-2xl bg-destructive/15 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/25"
        >
          Выйти из аккаунта
        </button>
      </div>

      {editOpen ? (
        <EditProfileSheet
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            await load();
            await update(); // обновить имя/email в сессии (шапка)
          }}
        />
      ) : null}
      {pwdOpen ? <PasswordSheet onClose={() => setPwdOpen(false)} /> : null}
      {addrEdit ? (
        <AddressSheet
          address={addrEdit === 'new' ? null : addrEdit}
          onClose={() => setAddrEdit(null)}
          onSaved={() => {
            setAddrEdit(null);
            load();
          }}
        />
      ) : null}
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function CabinetLink({
  href,
  icon: Icon,
  title,
  subtitle
}: {
  href: string;
  icon: typeof Store;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-[28px] border border-border bg-card p-5 shadow-card transition hover:border-primary sm:rounded-[32px] sm:p-6"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

// --- Шторки ---

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl bg-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-lg font-bold text-foreground">{title}</p>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  'mt-1 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SaveBar({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="mt-5 flex gap-2">
      <button
        type="submit"
        disabled={saving}
        className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? 'Сохранение…' : 'Сохранить'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-12 rounded-2xl border border-border px-5 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
      >
        Отмена
      </button>
    </div>
  );
}

function EditProfileSheet({
  profile,
  onClose,
  onSaved
}: {
  profile: ProfileData;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({ name: profile.name, phone: profile.phone, email: profile.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? 'Ошибка');
      return;
    }
    await onSaved();
    onClose();
  };

  return (
    <Sheet title="Изменить данные" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Имя">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
        </Field>
        <Field label="Телефон">
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <SaveBar saving={saving} onCancel={onClose} />
      </form>
    </Sheet>
  );
}

function PasswordSheet({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? 'Ошибка');
      return;
    }
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <Sheet title="Сменить пароль" onClose={onClose}>
      {done ? (
        <p className="py-4 text-center text-sm font-medium text-green-500">Пароль обновлён ✓</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field label="Текущий пароль">
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Новый пароль (мин. 6 символов)">
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className={inputClass}
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <SaveBar saving={saving} onCancel={onClose} />
        </form>
      )}
    </Sheet>
  );
}

function AddressSheet({
  address,
  onClose,
  onSaved
}: {
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: address?.label ?? '',
    address: address?.address ?? '',
    isDefault: address?.isDefault ?? false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim()) {
      setError('Введите адрес');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch(address ? `/api/profile/addresses/${address.id}` : '/api/profile/addresses', {
      method: address ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? 'Ошибка');
      return;
    }
    onSaved();
  };

  return (
    <Sheet title={address ? 'Изменить адрес' : 'Новый адрес'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Название (Дом, Работа…)">
          <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className={inputClass} />
        </Field>
        <Field label="Адрес">
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Использовать по умолчанию
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <SaveBar saving={saving} onCancel={onClose} />
      </form>
    </Sheet>
  );
}
