import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-lg px-4 py-6">
          <Outlet />
        </div>
      </main>
      <Navbar />
    </div>
  );
}
