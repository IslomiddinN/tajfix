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

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null); // null = closed
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([
      fetch('/api/seller/products').then((r) => r.json()),
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
    const url = editingId ? `/api/seller/products/${editingId}` : '/api/seller/products';
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
    const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' });
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
    <div className="fade-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Мои товары</h1>
          <p className="mt-1 text-sm text-muted-foreground">Добавление, изменение и удаление товаров.</p>
        </div>
        <button onClick={openCreate} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {form ? (
        <div className="mb-5 rounded-3xl border border-border bg-card p-5 fade-up">
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

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          У вас пока нет товаров
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="fade-up flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
              <img src={p.imageUrl} alt={p.title} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.brand}</p>
                <p className="mt-0.5 text-sm font-bold text-primary">
                  {p.price} сом <span className="font-normal text-muted-foreground">· остаток {p.stock}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(p)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
