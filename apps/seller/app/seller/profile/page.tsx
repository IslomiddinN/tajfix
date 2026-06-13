'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Boxes, ClipboardList, LogOut, Pencil, ShieldCheck, Wallet } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Seller {
  shopName: string;
  description: string;
  logoUrl: string;
  phone: string;
  isApproved: boolean;
  createdAt: string;
}

interface Overview {
  seller: Seller;
  stats: { productsCount: number; ordersCount: number; revenue: number; pendingItems: number };
}

type EditableSeller = Pick<Seller, 'shopName' | 'phone' | 'description' | 'logoUrl'>;

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} сом`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

export default function SellerProfilePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetch('/api/seller/overview')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (patch: EditableSeller) => {
    const res = await fetch('/api/seller/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return { ok: false, message: d.message ?? 'Не удалось сохранить' };
    }
    const updated: Seller = await res.json();
    setData((prev) => (prev ? { ...prev, seller: { ...prev.seller, ...updated } } : prev));
    return { ok: true };
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { seller, stats } = data;
  const level = stats.ordersCount >= 100 ? 'Топ-магазин' : stats.ordersCount >= 30 ? 'Растущий' : 'Новичок';

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Профиль магазина</h1>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/25"
        >
          <Pencil className="h-4 w-4" /> Редактировать
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
        {seller.logoUrl ? (
          <img src={seller.logoUrl} alt={seller.shopName} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-3xl text-primary-foreground">
            🏪
          </div>
        )}
        <div className="flex-1">
          <p className="text-xl font-bold text-foreground">{seller.shopName}</p>
          <p className="text-sm text-muted-foreground">{seller.phone}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.productsCount} товаров · {stats.ordersCount} заказов
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Boxes} label="Товаров" value={stats.productsCount} />
        <StatCard icon={ClipboardList} label="Заказов" value={stats.ordersCount} />
        <StatCard icon={Wallet} label="Доход" value={fmtMoney(stats.revenue)} />
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              seller.isApproved ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> {seller.isApproved ? 'Активен' : 'На проверке'}
          </span>
          <p className="mt-2 text-sm font-semibold text-foreground">{level}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Уровень</p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold text-foreground">Данные магазина</h2>
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <Row label="Название" value={seller.shopName} />
          <Row label="Телефон" value={seller.phone} />
          <Row label="Описание" value={seller.description || '—'} />
          <Row label="С нами с" value={fmtDate(seller.createdAt)} />
        </div>
      </section>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/15 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/25 sm:w-auto sm:px-8"
      >
        <LogOut className="h-4 w-4" /> Выйти из аккаунта
      </button>

      {editOpen && (
        <EditSheet seller={seller} onClose={() => setEditOpen(false)} onSave={updateProfile} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0">
      <p className="shrink-0 text-sm text-muted-foreground">{label}</p>
      <p className="text-right text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function EditSheet({
  seller,
  onClose,
  onSave
}: {
  seller: EditableSeller;
  onClose: () => void;
  onSave: (patch: EditableSeller) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [form, setForm] = useState<EditableSeller>({
    shopName: seller.shopName,
    phone: seller.phone,
    description: seller.description,
    logoUrl: seller.logoUrl
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof EditableSeller) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.shopName.trim() || !form.phone.trim()) {
      setError('Укажите название и телефон');
      return;
    }
    setSaving(true);
    setError('');
    const r = await onSave(form);
    setSaving(false);
    if (r.ok) onClose();
    else setError(r.message ?? 'Ошибка');
  };

  const inputClass =
    'mt-1 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl bg-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-lg font-bold text-foreground">Редактировать магазин</p>
        <div className="space-y-3">
          <Field label="Название магазина">
            <input value={form.shopName} onChange={set('shopName')} className={inputClass} />
          </Field>
          <Field label="Телефон">
            <input value={form.phone} onChange={set('phone')} className={inputClass} />
          </Field>
          <Field label="Описание">
            <textarea value={form.description} onChange={set('description')} rows={3} className={`${inputClass} resize-none`} />
          </Field>
          <Field label="Ссылка на логотип">
            <input value={form.logoUrl} onChange={set('logoUrl')} className={inputClass} />
          </Field>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button
            onClick={submit}
            disabled={saving}
            className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            onClick={onClose}
            className="h-12 rounded-2xl border border-border px-5 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
