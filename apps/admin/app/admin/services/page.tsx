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
    <div className="fade-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Услуги</h1>
          <p className="mt-1 text-sm text-muted-foreground">Управление услугами ремонта.</p>
        </div>
        <button onClick={openCreate} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-5 rounded-3xl border border-border bg-card p-5 fade-up">
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

      {services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Услуг пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="fade-up flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
              <img src={s.imageUrl} alt={s.title} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 text-sm font-bold text-primary">от {s.priceFrom} сом</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(s)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(s.id)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
