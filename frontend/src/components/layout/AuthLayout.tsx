import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">RunFuel</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Fuel smarter. Run stronger.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
