import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center lg:py-6">
      {/* Phone frame on desktop, full-screen on mobile */}
      <div className="relative flex w-full flex-col min-h-screen lg:min-h-0 lg:h-[min(92vh,900px)] lg:w-[min(420px,90vw)] lg:rounded-[20px] lg:border lg:border-[var(--color-surface-border)] lg:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)] lg:overflow-hidden">
        {/* Subtle accent glow on desktop */}
        <div className="pointer-events-none absolute -inset-px hidden lg:block rounded-[20px] bg-gradient-to-b from-[rgba(94,212,198,0.04)] to-transparent" />
        <main className="relative flex-1 overflow-y-auto pb-20 scrollbar-thin">
          <div key={pathname} className="px-5 py-7 page-enter">
            <Outlet />
          </div>
        </main>
        <Navbar />
      </div>
    </div>
  );
}
