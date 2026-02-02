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
    <nav className="sticky bottom-0 z-50 border-t border-[var(--color-surface-border)] bg-[rgba(11,28,34,0.92)] backdrop-blur-xl lg:rounded-b-[20px]">
      <div className="flex items-end justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon, iconActive, label, center }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              center
                ? `relative -mt-5 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`
                : `relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-all duration-300 ${
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
                    className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-[#0B1C22] shadow-[0_4px_20px_rgba(94,212,198,0.3)]'
                        : 'bg-[rgba(14,42,47,0.8)] text-[var(--color-text-muted)] border border-[var(--color-surface-border)]'
                    }`}
                  >
                    <span className={`${isActive ? iconActive : icon} text-[24px]`} />
                  </span>
                  <span className="mt-0.5">{label}</span>
                </>
              ) : (
                <>
                  <span className={`${isActive ? iconActive : icon} text-[20px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 h-[2px] w-4 rounded-full bg-[var(--color-primary)]" />
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
