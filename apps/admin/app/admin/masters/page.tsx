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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Мастера</h1>
          <p className="mt-2 text-muted-foreground">Управление каталогом мастеров.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-6 rounded-[28px] border border-border bg-card p-6 shadow-card">
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

      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Мастер</th>
              <th className="px-5 py-3 font-medium">Специализация</th>
              <th className="px-5 py-3 font-medium">Рейтинг</th>
              <th className="px-5 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {masters.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3">
                  <Link href={`/admin/masters/${m.id}`} className="group flex items-center gap-3">
                    <img src={m.avatarUrl} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.phone}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{m.specialization}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.rating.toFixed(1)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/masters/${m.id}`} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary" title="Открыть страницу"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => openEdit(m)} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(m.id)} className="rounded-full border border-border p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {masters.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Мастеров пока нет</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
