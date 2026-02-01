import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { progressApi } from '../../api/progress';
import type { WeeklySummary, StreakData, ConsistencyData } from '../../types/progress';

export function ProgressPage() {
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [consistency, setConsistency] = useState<ConsistencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, streakRes, consistencyRes] = await Promise.allSettled([
          progressApi.getWeekly(),
          progressApi.getStreak(),
          progressApi.getConsistency('30d'),
        ]);
        if (weeklyRes.status === 'fulfilled') setWeekly(weeklyRes.value.data);
        if (streakRes.status === 'fulfilled') setStreak(streakRes.value.data);
        if (consistencyRes.status === 'fulfilled') setConsistency(consistencyRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
        <div className="skeleton h-24" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  const chartData = weekly
    ? [
        { day: 'Mon', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Tue', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Wed', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Thu', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Fri', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Sat', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
        { day: 'Sun', intake: weekly.avg_intake_kcal || 0, target: weekly.avg_target_kcal || 0 },
      ]
    : [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15">
              <Flame size={16} className="text-orange-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Current Streak</span>
          </div>
          <div className="text-3xl font-bold">{streak?.current_streak || 0}</div>
          <div className="text-[10px] text-[var(--color-text-muted)]">days</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
              <TrendingUp size={16} className="text-blue-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Best Streak</span>
          </div>
          <div className="text-3xl font-bold">{streak?.longest_streak || 0}</div>
          <div className="text-[10px] text-[var(--color-text-muted)]">days</div>
        </div>
      </div>

      {/* Consistency */}
      {consistency && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-[var(--color-primary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                30-Day Consistency
              </h3>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {consistency.days_on_target}/{consistency.total_days} days
            </span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-extrabold text-[var(--color-primary)]">
              {Math.round(consistency.score)}
            </span>
            <span className="text-lg font-semibold text-[var(--color-text-muted)]">%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-light)]">
            <div className="progress-bar h-full" style={{ width: `${consistency.score}%` }} />
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {weekly ? (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-[var(--color-accent)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">This Week</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Avg Intake', value: weekly.avg_intake_kcal ? `${Math.round(weekly.avg_intake_kcal)}` : '—', unit: 'kcal' },
              { label: 'Avg Target', value: weekly.avg_target_kcal ? `${Math.round(weekly.avg_target_kcal)}` : '—', unit: 'kcal' },
              { label: 'Days Logged', value: `${weekly.days_logged}`, unit: '/ 7' },
              { label: 'On Target', value: `${weekly.days_on_target}`, unit: 'days' },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-[var(--color-bg)]/50 p-3">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.label}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold">{item.value}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="target" fill="var(--color-surface-light)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="intake" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="font-medium">Not enough data yet</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Keep logging to see your progress!</p>
        </div>
      )}
    </div>
  );
}
