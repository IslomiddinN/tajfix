'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Pencil, Power, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { fmtDate, fmtMoney, useMasterStore, type EditableMaster } from '@/lib/master/store';

export default function MasterProfile() {
  const { loading, master, bookings = [], reviews = [], toggleOnline, updateProfile } = useMasterStore();
  const [editOpen, setEditOpen] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!master) return null;

  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : master.rating;
  const level = completed >= 100 ? 'Эксперт' : completed >= 30 ? 'Профессионал' : 'Новичок';

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"
        >
          <Pencil className="h-3.5 w-3.5" /> Редактировать
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-3xl bg-card p-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-2xl font-bold text-primary-foreground">
          {master.name[0]}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{master.name}</p>
          <p className="text-xs text-muted-foreground">{master.specialization}</p>
          <p className="mt-1 text-xs text-muted-foreground">★ {avg.toFixed(1)} · {completed} заказов</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card p-3 text-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              master.isAvailable ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
            }`}
          >
            <ShieldCheck className="h-3 w-3" /> {master.isAvailable ? 'Доступен' : 'Оффлайн'}
          </span>
          <p className="mt-1 text-[10px] text-muted-foreground">Статус</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center">
          <p className="text-sm font-bold">{level}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Уровень</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center">
          <p className="text-sm font-bold">{fmtDate(master.createdAt)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">С нами с</p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold">Данные</h2>
        <div className="overflow-hidden rounded-3xl bg-card">
          <Row label="Телефон" value={master.phone} />
          <Row label="Специализация" value={master.specialization} />
          <Row label="Описание" value={master.description} />
          <Row label="Гарантия" value={master.guaranteeText} />
          <Row label="Цена от" value={fmtMoney(master.priceFrom)} />
          <Row label="Отзывов" value={String(master.reviewsCount)} />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-3xl bg-card p-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                master.isAvailable ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Power className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold">Принимать заказы</p>
          </div>
          <button onClick={toggleOnline} className={`relative h-7 w-12 rounded-full ${master.isAvailable ? 'bg-green-500' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${master.isAvailable ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </section>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/15 py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Выйти из аккаунта
      </button>

      {editOpen && (
        <EditSheet
          master={master}
          onClose={() => setEditOpen(false)}
          onSave={async (patch) => {
            const r = await updateProfile(patch);
            return r;
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 px-4 py-3 last:border-0">
      <p className="shrink-0 text-xs text-muted-foreground">{label}</p>
      <p className="text-right text-sm font-medium">{value}</p>
    </div>
  );
}

function EditSheet({
  master,
  onClose,
  onSave
}: {
  master: EditableMaster;
  onClose: () => void;
  onSave: (patch: Partial<EditableMaster>) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [form, setForm] = useState<EditableMaster>({
    name: master.name,
    phone: master.phone,
    specialization: master.specialization,
    description: master.description,
    guaranteeText: master.guaranteeText,
    avatarUrl: master.avatarUrl,
    priceFrom: master.priceFrom
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof EditableMaster) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: key === 'priceFrom' ? Number(e.target.value) : e.target.value }));

  const submit = async () => {
    setSaving(true);
    setError('');
    const r = await onSave(form);
    setSaving(false);
    if (r.ok) onClose();
    else setError(r.message ?? 'Ошибка');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-card p-5 fade-up" onClick={(e) => e.stopPropagation()}>
        <p className="mb-4 text-lg font-bold">Редактировать профиль</p>
        <div className="space-y-3">
          <Field label="Имя">
            <input value={form.name} onChange={set('name')} className="adminput" />
          </Field>
          <Field label="Телефон">
            <input value={form.phone} onChange={set('phone')} className="adminput" />
          </Field>
          <Field label="Специализация">
            <input value={form.specialization} onChange={set('specialization')} className="adminput" />
          </Field>
          <Field label="Описание">
            <textarea value={form.description} onChange={set('description')} rows={3} className="adminput resize-none" />
          </Field>
          <Field label="Гарантия">
            <input value={form.guaranteeText} onChange={set('guaranteeText')} className="adminput" />
          </Field>
          <Field label="Цена от (сом)">
            <input type="number" value={form.priceFrom} onChange={set('priceFrom')} className="adminput" />
          </Field>
          <Field label="Ссылка на фото">
            <input value={form.avatarUrl} onChange={set('avatarUrl')} className="adminput" />
          </Field>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button onClick={submit} disabled={saving} className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button onClick={onClose} className="h-12 rounded-2xl border border-border px-5 text-sm font-medium text-muted-foreground">
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
