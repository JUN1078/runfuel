import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'icon-[tabler--home]', iconActive: 'icon-[tabler--home-filled]', label: 'Home' },
  { to: '/log/photo', icon: 'icon-[tabler--camera]', iconActive: 'icon-[tabler--camera-filled]', label: 'Log' },
  { to: '/training', icon: 'icon-[tabler--barbell]', iconActive: 'icon-[tabler--barbell-filled]', label: 'Train' },
  { to: '/achievements', icon: 'icon-[tabler--trophy]', iconActive: 'icon-[tabler--trophy-filled]', label: 'Score' },
  { to: '/profile', icon: 'icon-[tabler--user-circle]', iconActive: 'icon-[tabler--user-circle]', label: 'Profile' },
];

export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon, iconActive, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`${isActive ? iconActive : icon} text-[22px]`} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-1 w-1 rounded-full bg-[var(--color-primary)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
