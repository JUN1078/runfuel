import { useEffect, useState } from 'react';
import {
  LogOut, Flame, Zap, Dumbbell, Activity, Target,
  ChevronRight, Mail, Ruler, Weight, Calendar, Gauge,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import apiClient from '../../api/client';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
      } catch { /* ignore */ }
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

  const goalOptions: { value: Goal; label: string; icon: typeof Flame; desc: string; tagVariant: 'orange' | 'accent' | 'purple' }[] = [
    { value: 'deficit', label: 'Fat Loss', icon: Flame, desc: 'Calorie deficit of ~400 kcal/day for lean body composition', tagVariant: 'orange' },
    { value: 'performance', label: 'Performance', icon: Zap, desc: 'Maintenance calories optimized for running performance', tagVariant: 'accent' },
    { value: 'bulking', label: 'Muscle Gain', icon: Dumbbell, desc: 'Surplus of ~400 kcal/day to support muscle growth', tagVariant: 'purple' },
  ];

  if (!user || !user.profile) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-28" />
        <div className="skeleton h-40" />
        <div className="skeleton h-32" />
        <div className="skeleton h-48" />
      </div>
    );
  }

  const profile = user.profile;
  const initials = user.email.slice(0, 2).toUpperCase();
  const tdee = profile.tdee ? Math.round(profile.tdee) : 0;
  const target = profile.daily_target_kcal ? Math.round(profile.daily_target_kcal) : 0;
  const bmr = profile.bmr ? Math.round(profile.bmr) : 0;

  return (
    <div className="space-y-7 stagger-children">
      {/* Profile header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <Avatar fallback={initials} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-light tracking-tight truncate">{user.email}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <span className="icon-[tabler--run] text-[11px]" /> Runner
              </Badge>
              <Badge variant="secondary">
                {profile.running_frequency} days/week
              </Badge>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              {profile.gender === 'male' ? 'Male' : 'Female'} &middot; {profile.age} years &middot; {profile.height_cm}cm &middot; {profile.weight_kg}kg
            </p>
          </div>
        </div>
      </div>

      {/* Calorie target */}
      <Card>
        <CardHeader>
          <Target size={14} className="text-[var(--color-primary)]" />
          <CardTitle>Daily Calorie Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light tracking-tight text-[var(--color-primary)]">
              {target || '—'}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">kcal / day</span>
          </div>

          {tdee > 0 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">BMR (Basal Metabolic Rate)</span>
                  <span className="font-normal">{bmr} kcal</span>
                </div>
                <Progress value={bmr} max={tdee + 400} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">TDEE (Total Daily Expenditure)</span>
                  <span className="font-normal">{tdee} kcal</span>
                </div>
                <Progress value={tdee} max={tdee + 400} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">Your Target</span>
                  <span className="font-normal text-[var(--color-primary)]">{target} kcal</span>
                </div>
                <Progress value={target} max={tdee + 400} indicatorClassName="!bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body & Running stats */}
      <Card>
        <CardHeader>
          <Activity size={14} className="text-[var(--color-accent)]" />
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              { icon: Calendar, label: 'Age', value: `${profile.age} years` },
              { icon: Ruler, label: 'Height', value: `${profile.height_cm} cm` },
              { icon: Weight, label: 'Weight', value: `${profile.weight_kg} kg` },
              { icon: Activity, label: 'Frequency', value: `${profile.running_frequency} days/week` },
              { icon: Gauge, label: 'Intensity', value: profile.training_intensity.replace('_', ' ') },
            ].map((item, i, arr) => (
              <div key={item.label}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-light)]">
                      <item.icon size={15} className="text-[var(--color-text-muted)]" />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
                  </div>
                  <span className="text-sm font-normal capitalize">{item.value}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal selector */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Flame size={14} className="text-[var(--color-warning)]" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Current Goal</h3>
        </div>
        <div className="space-y-2.5">
          {goalOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = profile.goal === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleGoalChange(opt.value)}
                disabled={loading || selected}
                className={cn(
                  'glass-card flex w-full items-center gap-3 p-4 text-left transition-all',
                  selected
                    ? 'ring-1 ring-[var(--color-primary)] bg-[var(--color-primary)]/[0.03]'
                    : 'hover:bg-[var(--color-surface-hover)] hover:-translate-y-0.5',
                  'disabled:opacity-60',
                )}
              >
                <div className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                  selected ? 'bg-[var(--color-primary)]/15' : 'bg-[var(--color-surface-light)]',
                )}>
                  <Icon size={20} className={selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-normal text-sm">{opt.label}</span>
                    {selected && <Badge variant="default">Active</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)] leading-relaxed">{opt.desc}</p>
                </div>
                <ChevronRight size={16} className={cn(
                  'shrink-0 transition-colors',
                  selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]',
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Account section */}
      <Card>
        <CardHeader>
          <Mail size={14} className="text-[var(--color-text-muted)]" />
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--color-text-secondary)]">Email</span>
            <span className="text-sm font-normal truncate ml-4">{user.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="glass-card flex w-full items-center justify-center gap-2 py-3.5 text-sm font-normal text-[var(--color-danger)] transition-all hover:bg-red-500/5 hover:-translate-y-0.5 active:translate-y-0"
      >
        <LogOut size={16} /> Log Out
      </button>
    </div>
  );
}
