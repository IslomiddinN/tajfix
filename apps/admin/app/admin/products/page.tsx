'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
  type: 'SERVICE' | 'PRODUCT';
}

interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  imageUrl: string;
  rating: number;
  stock: number;
  isHit: boolean;
  isNew: boolean;
}

const empty = {
  title: '',
  description: '',
  brand: '',
  categoryId: '',
  price: '',
  oldPrice: '',
  discountPercent: '',
  imageUrl: '',
  rating: '',
  stock: '',
  isHit: false,
  isNew: false
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null); // null = closed
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json())
    ]);
    setProducts(Array.isArray(p) ? p : []);
    setCategories(Array.isArray(c) ? c.filter((x: Category) => x.type === 'PRODUCT') : []);
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

  function openEdit(product: Product) {
    setEditingId(product.id);
    setError('');
    setForm({
      title: product.title,
      description: product.description,
      brand: product.brand,
      categoryId: product.categoryId,
      price: String(product.price),
      oldPrice: product.oldPrice != null ? String(product.oldPrice) : '',
      discountPercent: product.discountPercent != null ? String(product.discountPercent) : '',
      imageUrl: product.imageUrl,
      rating: String(product.rating),
      stock: String(product.stock),
      isHit: product.isHit,
      isNew: product.isNew
    });
  }

  async function save() {
    setSaving(true);
    setError('');
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
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
    if (!confirm('Удалить товар?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Ошибка удаления');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
          <h1 className="text-3xl font-semibold text-foreground">Товары</h1>
          <p className="mt-2 text-muted-foreground">Добавление, изменение и удаление товаров магазина.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-6 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">{editingId ? 'Редактирование товара' : 'Новый товар'}</h2>
            <button onClick={() => setForm(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-muted-foreground">Название<input className="adminput" {...field('title')} /></label>
            <label className="text-sm text-muted-foreground">Бренд<input className="adminput" {...field('brand')} /></label>
            <label className="text-sm text-muted-foreground">Категория
              <select className="adminput" {...field('categoryId')}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">Цена (сом)<input type="number" className="adminput" {...field('price')} /></label>
            <label className="text-sm text-muted-foreground">Старая цена<input type="number" className="adminput" {...field('oldPrice')} /></label>
            <label className="text-sm text-muted-foreground">Скидка %<input type="number" className="adminput" {...field('discountPercent')} /></label>
            <label className="text-sm text-muted-foreground">Рейтинг<input type="number" step="0.1" className="adminput" {...field('rating')} /></label>
            <label className="text-sm text-muted-foreground">Остаток<input type="number" className="adminput" {...field('stock')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Ссылка на фото<input className="adminput" {...field('imageUrl')} /></label>
            <label className="text-sm text-muted-foreground sm:col-span-2">Описание<textarea className="adminput" rows={3} {...field('description')} /></label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.isHit} onChange={(e) => setForm((f: any) => ({ ...f, isHit: e.target.checked }))} /> Хит</label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm((f: any) => ({ ...f, isNew: e.target.checked }))} /> Новинка</label>
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
              <th className="px-5 py-3 font-medium">Товар</th>
              <th className="px-5 py-3 font-medium">Цена</th>
              <th className="px-5 py-3 font-medium">Остаток</th>
              <th className="px-5 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.title} className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.price} сом</td>
                <td className="px-5 py-3 text-muted-foreground">{p.stock}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="rounded-full border border-border p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Товаров пока нет</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
