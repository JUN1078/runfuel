import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] lg:py-6">
      {/* Phone frame on desktop, full-screen on mobile */}
      <div className="relative flex w-full flex-col min-h-screen lg:min-h-0 lg:h-[min(92vh,900px)] lg:w-[min(420px,90vw)] lg:rounded-3xl lg:border lg:border-[var(--color-surface-border)] lg:shadow-2xl lg:shadow-black/40 lg:overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-thin">
          <div key={pathname} className="mx-auto max-w-2xl px-4 py-6 page-enter sm:px-6 lg:px-5">
            <Outlet />
          </div>
        </main>
        <Navbar />
      </div>
    </div>
  );
}
