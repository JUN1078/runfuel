import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, BarChart3, UserCircle } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log/photo', icon: Camera, label: 'Log Food' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-surface-light)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-lg justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
