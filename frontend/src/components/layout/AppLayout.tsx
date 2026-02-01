import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        <div key={pathname} className="mx-auto max-w-lg px-4 py-6 page-enter">
          <Outlet />
        </div>
      </main>
      <Navbar />
    </div>
  );
}
