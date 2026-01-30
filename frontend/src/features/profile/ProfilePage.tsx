import { useEffect, useState } from 'react';
import { LogOut, Flame, Zap, Dumbbell } from 'lucide-react';
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

  const goalOptions: { value: Goal; label: string; icon: typeof Flame; desc: string }[] = [
    { value: 'deficit', label: 'Fat Loss', icon: Flame, desc: '-400 kcal/day' },
    { value: 'performance', label: 'Performance', icon: Zap, desc: 'Maintenance' },
    { value: 'bulking', label: 'Muscle Gain', icon: Dumbbell, desc: '+400 kcal/day' },
  ];

  if (!user || !user.profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* User info */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Account</h3>
        <p className="text-sm">{user.email}</p>
      </div>

      {/* Body metrics */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Body Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[var(--color-text-muted)]">Age</div>
            <div className="font-semibold">{profile.age} years</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">Gender</div>
            <div className="font-semibold capitalize">{profile.gender}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">Height</div>
            <div className="font-semibold">{profile.height_cm} cm</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">Weight</div>
            <div className="font-semibold">{profile.weight_kg} kg</div>
          </div>
        </div>
      </div>

      {/* Running profile */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Running Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[var(--color-text-muted)]">Frequency</div>
            <div className="font-semibold">{profile.running_frequency} days/week</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">Intensity</div>
            <div className="font-semibold capitalize">{profile.training_intensity.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Calorie targets */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Calorie Targets</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[var(--color-text-muted)]">BMR</div>
            <div className="font-semibold">{profile.bmr ? Math.round(profile.bmr) : '—'}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">TDEE</div>
            <div className="font-semibold">{profile.tdee ? Math.round(profile.tdee) : '—'}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)]">Daily Target</div>
            <div className="font-semibold text-[var(--color-primary)]">
              {profile.daily_target_kcal ? Math.round(profile.daily_target_kcal) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Goal selector */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Current Goal</h3>
        <div className="space-y-2">
          {goalOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = profile.goal === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleGoalChange(opt.value)}
                disabled={loading || selected}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors disabled:opacity-50 ${
                  selected
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-light)]'
                }`}
              >
                <Icon size={20} />
                <div className="flex-1">
                  <div className="font-medium">{opt.label}</div>
                  <div className={`text-xs ${selected ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-danger)] py-3 font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
      >
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}
