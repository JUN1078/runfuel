import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-16 -right-16 h-56 w-56 rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-48 w-48 rounded-full bg-[var(--color-purple)] opacity-[0.05] blur-[90px]" />

      <div className="relative z-10 w-full max-w-md page-enter">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/15">
            <span className="icon-[tabler--run] text-3xl text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-[var(--color-primary)]">Run</span><span className="text-[var(--color-text)]">Fuel</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Fuel smarter. Run stronger.
          </p>
        </div>
        <div className="glass-card p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
