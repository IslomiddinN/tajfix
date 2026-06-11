'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { KeyRound, Pencil, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

export default function AdminProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const load = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) setProfile(await res.json());
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  const initials = profile.name.trim().slice(0, 1).toUpperCase() || 'A';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Профиль</h1>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/25"
        >
          <Pencil className="h-4 w-4" /> Редактировать
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-2xl font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold text-foreground">{profile.name}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Администратор
          </span>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
        <Row label="Email" value={profile.email} />
        <Row label="Телефон" value={profile.phone} />
        <Row label="В системе с" value={fmtDate(profile.createdAt)} />
      </section>

      <button
        onClick={() => setPwdOpen(true)}
        className="mt-4 flex w-full items-center justify-between gap-4 rounded-[28px] border border-border bg-card p-5 shadow-card transition hover:border-primary"
      >
        <span className="flex items-center gap-3 font-semibold text-foreground">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          Сменить пароль
        </span>
      </button>

      {editOpen ? (
        <EditSheet
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            await load();
            await update();
          }}
        />
      ) : null}
      {pwdOpen ? <PasswordSheet onClose={() => setPwdOpen(false)} /> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

const inputClass =
  'mt-1 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

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

function EditSheet({
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
    <Sheet title="Редактировать профиль" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Имя</span>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Телефон</span>
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
        </label>
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
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Текущий пароль</span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Новый пароль (мин. 6 символов)</span>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className={inputClass}
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <SaveBar saving={saving} onCancel={onClose} />
        </form>
      )}
    </Sheet>
  );
}
