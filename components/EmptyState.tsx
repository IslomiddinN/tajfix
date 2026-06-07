'use client';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
      <div className="text-3xl">😌</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-xs text-sm leading-6">{description}</p>
    </div>
  );
}
