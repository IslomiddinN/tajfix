'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Phone, Star, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { STATUS_COLOR, STATUS_LABEL, type OrderStatus } from '@/lib/master/store';

interface Booking {
  id: string;
  status: OrderStatus;
  problemText: string;
  address: string;
  preferredDate: string;
  estimatedPrice: number;
  service: { title: string };
  user: { name: string | null; phone: string | null };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string | null };
}

interface MasterDetail {
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
  createdAt: string;
  user: { email: string } | null;
  bookings: Booking[];
  reviews: Review[];
}

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} сом`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminMasterDetail() {
  const { id } = useParams<{ id: string }>();
  const [master, setMaster] = useState<MasterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  function load() {
    fetch(`/api/admin/masters/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => d && setMaster(d))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (notFound || !master) {
    return (
      <div>
        <Link href="/admin/masters" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> К списку мастеров
        </Link>
        <p className="mt-6 text-muted-foreground">Мастер не найден.</p>
      </div>
    );
  }

  const completed = master.bookings.filter((b) => b.status === 'COMPLETED');
  const revenue = completed.reduce((a, b) => a + b.estimatedPrice, 0);

  return (
    <div>
      <Link href="/admin/masters" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> К списку мастеров
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <img src={master.avatarUrl} alt={master.name} className="h-20 w-20 rounded-2xl object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{master.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                master.isAvailable ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
              }`}
            >
              {master.isAvailable ? 'Доступен' : 'Оффлайн'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{master.specialization}</p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <a href={`tel:${master.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 hover:text-foreground">
              <Phone className="h-4 w-4" /> {master.phone}
            </a>
            {master.user?.email && <span>· {master.user.email}</span>}
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400" /> {master.rating.toFixed(1)} ({master.reviewsCount})
            </span>
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" /> Редактировать
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Всего заявок" value={String(master.bookings.length)} />
        <StatCard label="Завершено" value={String(completed.length)} />
        <StatCard label="Выручка" value={fmtMoney(revenue)} />
        <StatCard label="Цена от" value={fmtMoney(master.priceFrom)} />
      </div>

      <p className="mt-4 rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{master.description}</p>

      {/* Bookings */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Заявки мастера</h2>
        {master.bookings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Заявок пока нет
          </p>
        ) : (
          <div className="space-y-3">
            {master.bookings.map((b) => (
              <div key={b.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{b.service.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.user.name ?? 'Клиент'} · {b.user.phone ?? b.address}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{fmtDate(b.preferredDate)}</span>
                  <span className="font-semibold text-primary">{fmtMoney(b.estimatedPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Отзывы</h2>
        {master.reviews.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Отзывов пока нет
          </p>
        ) : (
          <div className="space-y-3">
            {master.reviews.map((r) => (
              <div key={r.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{r.user.name ?? 'Клиент'}</p>
                  <span className="inline-flex items-center gap-0.5 text-sm text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDate(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <EditModal
          master={master}
          onClose={() => setEditing(false)}
          onSaved={(m) => {
            setMaster((prev) => (prev ? { ...prev, ...m } : prev));
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EditModal({
  master,
  onClose,
  onSaved
}: {
  master: MasterDetail;
  onClose: () => void;
  onSaved: (m: Partial<MasterDetail>) => void;
}) {
  const [form, setForm] = useState({
    name: master.name,
    phone: master.phone,
    specialization: master.specialization,
    description: master.description,
    avatarUrl: master.avatarUrl,
    rating: String(master.rating),
    reviewsCount: String(master.reviewsCount),
    distanceKm: String(master.distanceKm),
    priceFrom: String(master.priceFrom),
    guaranteeText: master.guaranteeText,
    isAvailable: master.isAvailable
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const field = (name: keyof typeof form) => ({
    value: form[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value }))
  });

  async function save() {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/admin/masters/${master.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Ошибка сохранения');
      return;
    }
    onSaved(await res.json());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Редактирование мастера</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
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
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
            />{' '}
            Доступен
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        <div className="mt-5 flex gap-3">
          <button
            disabled={saving}
            onClick={save}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
