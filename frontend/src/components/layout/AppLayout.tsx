import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        <div key={pathname} className="mx-auto max-w-2xl px-4 py-6 page-enter sm:px-6">
          <Outlet />
        </div>
      </main>
      <Navbar />
    </div>
  );
}
