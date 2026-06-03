'use client';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 rounded-3xl border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-700">
      <div className="text-3xl">😌</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-xs text-sm leading-6">{description}</p>
    </div>
  );
}
