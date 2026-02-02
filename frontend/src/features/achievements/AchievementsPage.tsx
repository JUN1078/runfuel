import { useEffect, useState } from 'react';
import { Flame, Trophy, Star, Target, Camera, Footprints, Flag, Award, Zap, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { gamificationApi } from '../../api/gamification';
import { progressApi } from '../../api/progress';
import type { UserStats, UserBadgeInfo } from '../../types/gamification';
import type { WeeklySummary, ConsistencyData } from '../../types/progress';

const iconMap: Record<string, typeof Flame> = {
  flame: Flame, trophy: Trophy, star: Star, target: Target, camera: Camera,
  footprints: Footprints, flag: Flag, award: Award, zap: Zap, medal: Medal,
  'clipboard-list': Target, 'clipboard-check': Target, image: Camera,
  'map-pin': Flag, mountain: Zap,
  utensils: Star,
};

const tierColors = ['', '#9ca3af', '#60a5fa', '#fbbf24', '#a855f7'];

export function AchievementsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadgeInfo[]>([]);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [consistency, setConsistency] = useState<ConsistencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'badges' | 'progress'>('badges');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, b, w, , c] = await Promise.allSettled([
          gamificationApi.getStats(),
          gamificationApi.getBadges(),
          progressApi.getWeekly(),
          progressApi.getStreak(),
          progressApi.getConsistency('30d'),
        ]);
        if (s.status === 'fulfilled') setStats(s.value.data);
        if (b.status === 'fulfilled') setBadges(b.value.data);
        if (w.status === 'fulfilled') setWeekly(w.value.data);
        if (c.status === 'fulfilled') setConsistency(c.value.data);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-32" />
      <div className="skeleton h-24" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-24" />)}
      </div>
    </div>
  );

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>

      {/* Level & XP Card */}
      {stats && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Trophy size={24} className="text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold">Level {stats.level}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{stats.total_xp} XP total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--color-primary)]">{earnedCount}</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">/{badges.length} badges</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
            <div className="progress-bar h-full" style={{ width: `${stats.xp_progress}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-[var(--color-text-muted)] text-right">
            {Math.round(stats.xp_progress)}% to Level {stats.level + 1}
          </div>
        </div>
      )}

      {/* Streak & Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Flame, label: 'Streak', value: stats?.current_streak || 0, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Target, label: 'On Target', value: stats?.days_on_target || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: Camera, label: 'Photos', value: stats?.total_photos || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Star, label: 'Perfect', value: stats?.perfect_weeks || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="glass-card p-3 text-center">
            <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
              <Icon size={14} className={color} />
            </div>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[var(--color-surface)] p-1">
        {(['badges', 'progress'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Badges Grid */}
      {tab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {badges.map((b, i) => {
            const Icon = iconMap[b.badge.icon] || Star;
            const color = tierColors[b.badge.tier] || '#9ca3af';
            return (
              <div
                key={b.badge.id}
                className={`glass-card p-3 text-center transition-all ${
                  b.earned ? 'badge-earned' : 'opacity-30'
                }`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div
                  className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}20`, border: b.earned ? `2px solid ${color}` : '2px solid transparent' }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="text-[11px] font-semibold leading-tight">{b.badge.name}</div>
                <div className="mt-0.5 text-[9px] text-[var(--color-text-muted)] leading-tight">{b.badge.description}</div>
                {b.earned && (
                  <div className="mt-1 text-[9px] font-medium text-[var(--color-primary)]">+{b.badge.xp_reward} XP</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Tab */}
      {tab === 'progress' && (
        <div className="space-y-4">
          {/* Consistency */}
          {consistency && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">30-Day Consistency</h3>
                <span className="text-lg font-bold text-[var(--color-primary)]">{Math.round(consistency.score)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
                <div className="progress-bar h-full" style={{ width: `${consistency.score}%` }} />
              </div>
              <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                {consistency.days_on_target} / {consistency.total_days} days on target
              </div>
            </div>
          )}

          {/* Weekly Summary */}
          {weekly && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3">This Week</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Avg Intake</div>
                  <div className="text-base font-bold">{weekly.avg_intake_kcal ? Math.round(weekly.avg_intake_kcal) : '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Days Logged</div>
                  <div className="text-base font-bold">{weekly.days_logged}/7</div>
                </div>
              </div>

              <div className="mt-4 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: 'M', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'T', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'W', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'T', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'F', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'S', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                    { day: 'S', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
                  ]}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="intake" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
