import { useEffect, useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
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
        const [weeklyRes, streakRes, consistencyRes] = await Promise.all([
          progressApi.getWeekly(),
          progressApi.getStreak(),
          progressApi.getConsistency('30d'),
        ]);
        setWeekly(weeklyRes.data);
        setStreak(streakRes.data);
        setConsistency(consistencyRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--color-surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Flame size={16} className="text-orange-500" />
            Current Streak
          </div>
          <div className="text-3xl font-bold">{streak?.current_streak || 0}</div>
          <div className="text-xs text-[var(--color-text-muted)]">days</div>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <TrendingUp size={16} className="text-blue-500" />
            Longest Streak
          </div>
          <div className="text-3xl font-bold">{streak?.longest_streak || 0}</div>
          <div className="text-xs text-[var(--color-text-muted)]">days</div>
        </div>
      </div>

      {/* Consistency */}
      {consistency && (
        <div className="rounded-xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
            30-Day Consistency
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[var(--color-primary)]">
              {Math.round(consistency.score)}%
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              ({consistency.days_on_target} / {consistency.total_days} days on target)
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-light)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)]"
              style={{ width: `${consistency.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {weekly && (
        <div className="rounded-xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">This Week</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--color-text-muted)]">Avg Intake</div>
              <div className="text-xl font-semibold">
                {weekly.avg_intake_kcal ? Math.round(weekly.avg_intake_kcal) : '—'} kcal
              </div>
            </div>
            <div>
              <div className="text-[var(--color-text-muted)]">Avg Target</div>
              <div className="text-xl font-semibold">
                {weekly.avg_target_kcal ? Math.round(weekly.avg_target_kcal) : '—'} kcal
              </div>
            </div>
            <div>
              <div className="text-[var(--color-text-muted)]">Days Logged</div>
              <div className="text-xl font-semibold">{weekly.days_logged} / 7</div>
            </div>
            <div>
              <div className="text-[var(--color-text-muted)]">Days On Target</div>
              <div className="text-xl font-semibold">{weekly.days_on_target} days</div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="intake" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!weekly && (
        <div className="rounded-xl bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-text-muted)]">
            Not enough data yet. Keep logging to see your progress!
          </p>
        </div>
      )}
    </div>
  );
}
