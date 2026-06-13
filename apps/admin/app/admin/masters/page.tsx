'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Master {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  specialization: string;
  description: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  priceFrom: number;
  guaranteeText: string;
  isAvailable: boolean;
}

const empty = {
  name: '',
  phone: '',
  avatarUrl: '',
  specialization: '',
  description: '',
  rating: '',
  reviewsCount: '',
  distanceKm: '',
  priceFrom: '',
  guaranteeText: '',
  isAvailable: true
};

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const m = await fetch('/api/admin/masters').then((r) => r.json());
    setMasters(Array.isArray(m) ? m : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setError('');
    setForm({ ...empty });
  }

  function openEdit(m: Master) {
    setEditingId(m.id);
    setError('');
    setForm({
      name: m.name,
      phone: m.phone,
      avatarUrl: m.avatarUrl,
      specialization: m.specialization,
      description: m.description,
      rating: String(m.rating),
      reviewsCount: String(m.reviewsCount),
      distanceKm: String(m.distanceKm),
      priceFrom: String(m.priceFrom),
      guaranteeText: m.guaranteeText,
      isAvailable: m.isAvailable
    });
  }

  async function save() {
    setSaving(true);
    setError('');
    const url = editingId ? `/api/admin/masters/${editingId}` : '/api/admin/masters';
    const res = await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Ошибка сохранения');
      return;
    }
    setForm(null);
    setEditingId(null);
    setLoading(true);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Удалить мастера?')) return;
    const res = await fetch(`/api/admin/masters/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Ошибка удаления');
      return;
    }
    setMasters((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <LoadingSpinner />;

  const field = (name: keyof typeof empty) => ({
    value: form?.[name] ?? '',
    onChange: (e: any) => setForm((f: any) => ({ ...f, [name]: e.target.value }))
  });

  return (
    <div className="fade-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Мастера</h1>
          <p className="mt-1 text-sm text-muted-foreground">Управление каталогом мастеров.</p>
        </div>
        <button onClick={openCreate} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-5 rounded-3xl border border-border bg-card p-5 fade-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">{editingId ? 'Редактирование мастера' : 'Новый мастер'}</h2>
            <button onClick={() => setForm(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-muted-foreground">Имя<input className="adminput" {...field('name')} /></label>
            <label className="text-sm text-muted-foreground">Телефон<input className="adminput" {...field('phone')} /></label>
            <label className="text-sm text-muted-foreground">Специализация<input className="adminput" {...field('specialization')} /></label>
            <label className="text-sm text-muted-foreground">Цена от (сом)<input type="number" className="adminput" {...field('priceFrom')} /></label>
            <label className="text-sm text-muted-foreground">Рейтинг<input type="number" step="0.1" className="adminput" {...field('rating')} /></label>
            <label className="text-sm text-muted-foreground">Кол-во отзывов<input type="number" className="adminput" {...field('reviewsCount')} /></label>
            <label className="text-sm text-muted-foreground">Расстояние (км)<input type="number" step="0.1" className="adminput" {...field('distanceKm')} /></label>
            <label className="text-sm text-muted-foreground">Гарантия<input className="adminput" {...field('guaranteeText')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Ссылка на фото<input className="adminput" {...field('avatarUrl')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Описание<textarea className="adminput" rows={3} {...field('description')} /></label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f: any) => ({ ...f, isAvailable: e.target.checked }))} /> Доступен</label>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-5 flex gap-3">
            <button disabled={saving} onClick={save} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">{saving ? 'Сохранение…' : 'Сохранить'}</button>
            <button onClick={() => setForm(null)} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">Отмена</button>
          </div>
        </div>
      ) : null}

      {masters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Мастеров пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {masters.map((m) => (
            <div key={m.id} className="fade-up flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
              <Link href={`/admin/masters/${m.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                <img src={m.avatarUrl} alt={m.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground group-hover:text-primary">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.specialization}</p>
                  <p className="mt-0.5 text-sm font-bold text-primary">★ {m.rating.toFixed(1)} <span className="font-normal text-muted-foreground">· от {m.priceFrom} сом</span></p>
                </div>
              </Link>
              <div className="flex shrink-0 gap-2">
                <Link href={`/admin/masters/${m.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground" title="Открыть страницу"><Eye className="h-4 w-4" /></Link>
                <button onClick={() => openEdit(m)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(m.id)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
