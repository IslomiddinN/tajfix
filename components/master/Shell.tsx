import { type ReactNode } from 'react';
import { SideNav } from './SideNav';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <SideNav />
      <main className="mx-auto w-full max-w-[430px] pb-24 lg:mx-0 lg:max-w-3xl lg:flex-1 lg:px-6 lg:pb-12">
        {children}
      </main>
    </div>
  );
}
