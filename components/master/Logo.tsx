export function Logo({ size = 'md', animate = false }: { size?: 'sm' | 'md' | 'lg'; animate?: boolean }) {
  const s = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className={`${animate ? 'logo-in' : ''} flex items-center gap-2 font-black tracking-tight ${s}`}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2.6-2.6z" />
        </svg>
      </span>
      <span>
        TAJ<span className="text-primary">FIX</span>
      </span>
    </div>
  );
}
