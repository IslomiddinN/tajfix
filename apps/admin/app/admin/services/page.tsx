'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
  type: 'SERVICE' | 'PRODUCT';
}

interface Service {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priceFrom: number;
  imageUrl: string;
  isUrgentAvailable: boolean;
}

const empty = { title: '', description: '', categoryId: '', priceFrom: '', imageUrl: '', isUrgentAvailable: true };

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, c] = await Promise.all([
      fetch('/api/admin/services').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json())
    ]);
    setServices(Array.isArray(s) ? s : []);
    setCategories(Array.isArray(c) ? c.filter((x: Category) => x.type === 'SERVICE') : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setError('');
    setForm({ ...empty, categoryId: categories[0]?.id ?? '' });
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setError('');
    setForm({
      title: s.title,
      description: s.description,
      categoryId: s.categoryId,
      priceFrom: String(s.priceFrom),
      imageUrl: s.imageUrl,
      isUrgentAvailable: s.isUrgentAvailable
    });
  }

  async function save() {
    setSaving(true);
    setError('');
    const url = editingId ? `/api/admin/services/${editingId}` : '/api/admin/services';
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
    if (!confirm('Удалить услугу?')) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Ошибка удаления');
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
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
          <h1 className="text-3xl font-semibold text-foreground">Услуги</h1>
          <p className="mt-2 text-muted-foreground">Управление услугами ремонта.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-6 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">{editingId ? 'Редактирование услуги' : 'Новая услуга'}</h2>
            <button onClick={() => setForm(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-muted-foreground">Название<input className="adminput" {...field('title')} /></label>
            <label className="text-sm text-muted-foreground">Категория
              <select className="adminput" {...field('categoryId')}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">Цена от (сом)<input type="number" className="adminput" {...field('priceFrom')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Ссылка на фото<input className="adminput" {...field('imageUrl')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Описание<textarea className="adminput" rows={3} {...field('description')} /></label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.isUrgentAvailable} onChange={(e) => setForm((f: any) => ({ ...f, isUrgentAvailable: e.target.checked }))} /> Срочный выезд доступен</label>
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
              <th className="px-5 py-3 font-medium">Услуга</th>
              <th className="px-5 py-3 font-medium">Цена от</th>
              <th className="px-5 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={s.imageUrl} alt={s.title} className="h-12 w-12 rounded-xl object-cover" />
                    <p className="font-medium text-foreground">{s.title}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.priceFrom} сом</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(s)} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(s.id)} className="rounded-full border border-border p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">Услуг пока нет</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
