import { useEffect, useState } from 'react';
import { LogOut, Flame, Zap, Dumbbell, User2, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import apiClient from '../../api/client';
import type { User, Goal } from '../../types/user';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user: storeUser, logout, refreshToken } = useAuthStore();
  const [user, setUser] = useState<User | null>(storeUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await apiClient.get<User>('/api/v1/users/me');
        setUser(data);
      } catch {}
    };
    fetchUser();
  }, []);

  const handleGoalChange = async (goal: Goal) => {
    setLoading(true);
    try {
      await apiClient.patch('/api/v1/users/me/goal', { goal });
      const { data } = await apiClient.get<User>('/api/v1/users/me');
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      logout();
      navigate('/login');
    }
  };

  const goalOptions: { value: Goal; label: string; icon: typeof Flame; desc: string; color: string }[] = [
    { value: 'deficit', label: 'Fat Loss', icon: Flame, desc: '-400 kcal/day', color: 'text-orange-400' },
    { value: 'performance', label: 'Performance', icon: Zap, desc: 'Maintenance', color: 'text-blue-400' },
    { value: 'bulking', label: 'Muscle Gain', icon: Dumbbell, desc: '+400 kcal/day', color: 'text-purple-400' },
  ];

  if (!user || !user.profile) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-24" />
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      {/* User info */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/15">
            <User2 size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="font-semibold">{user.email}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Runner since day one</p>
          </div>
        </div>
      </div>

      {/* Body metrics */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-[var(--color-primary)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Body Metrics</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Age', value: `${profile.age} years` },
            { label: 'Gender', value: profile.gender },
            { label: 'Height', value: `${profile.height_cm} cm` },
            { label: 'Weight', value: `${profile.weight_kg} kg` },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-[var(--color-bg)]/50 p-3">
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.label}</div>
              <div className="mt-1 text-sm font-semibold capitalize">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Running profile */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={14} className="text-[var(--color-accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Running Profile</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--color-bg)]/50 p-3">
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Frequency</div>
            <div className="mt-1 text-sm font-semibold">{profile.running_frequency} days/week</div>
          </div>
          <div className="rounded-xl bg-[var(--color-bg)]/50 p-3">
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Intensity</div>
            <div className="mt-1 text-sm font-semibold capitalize">{profile.training_intensity.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Calorie targets */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-[var(--color-warning)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Calorie Targets</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'BMR', value: profile.bmr ? Math.round(profile.bmr) : '—', highlight: false },
            { label: 'TDEE', value: profile.tdee ? Math.round(profile.tdee) : '—', highlight: false },
            { label: 'Daily Target', value: profile.daily_target_kcal ? Math.round(profile.daily_target_kcal) : '—', highlight: true },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-[var(--color-bg)]/50 p-3 text-center">
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.label}</div>
              <div className={`mt-1 text-lg font-bold ${item.highlight ? 'text-[var(--color-primary)]' : ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal selector */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Current Goal</h3>
        <div className="space-y-2">
          {goalOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = profile.goal === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleGoalChange(opt.value)}
                disabled={loading || selected}
                className={`glass-card flex w-full items-center gap-3 p-4 text-left transition-all disabled:opacity-60 ${
                  selected ? 'ring-1 ring-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  selected ? 'bg-[var(--color-primary)]/15' : 'bg-[var(--color-surface-light)]'
                }`}>
                  <Icon size={20} className={selected ? 'text-[var(--color-primary)]' : opt.color} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{opt.desc}</div>
                </div>
                {selected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="glass-card flex w-full items-center justify-center gap-2 py-3.5 font-semibold text-[var(--color-danger)] transition-colors hover:bg-red-500/5"
      >
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}
