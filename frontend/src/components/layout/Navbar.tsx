import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/training', icon: 'icon-[tabler--run]', iconActive: 'icon-[tabler--run]', label: 'Train', center: false },
  { to: '/log/photo', icon: 'icon-[tabler--camera]', iconActive: 'icon-[tabler--camera-filled]', label: 'Log', center: false },
  { to: '/dashboard', icon: 'icon-[tabler--layout-dashboard]', iconActive: 'icon-[tabler--layout-dashboard]', label: 'Home', center: true },
  { to: '/achievements', icon: 'icon-[tabler--trophy]', iconActive: 'icon-[tabler--trophy-filled]', label: 'Score', center: false },
  { to: '/profile', icon: 'icon-[tabler--user-circle]', iconActive: 'icon-[tabler--user-circle]', label: 'Profile', center: false },
];

export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-end justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon, iconActive, label, center }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              center
                ? `relative -mt-5 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`
                : `relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`
            }
          >
            {({ isActive }) =>
              center ? (
                <>
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_rgba(34,197,94,0.4)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-surface-border)]'
                    }`}
                  >
                    <span className={`${isActive ? iconActive : icon} text-[24px]`} />
                  </span>
                  <span className="mt-0.5">{label}</span>
                </>
              ) : (
                <>
                  <span className={`${isActive ? iconActive : icon} text-[22px]`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 h-1 w-1 rounded-full bg-[var(--color-primary)]" />
                  )}
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
