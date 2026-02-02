import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, PenLine, Flame, Trophy, Sparkles } from 'lucide-react';
import { ProgressRing } from '../../components/ProgressRing';
import { FoodCard } from '../../components/FoodCard';
import { caloriesApi } from '../../api/calories';
import { foodApi } from '../../api/food';
import { gamificationApi } from '../../api/gamification';
import type { CalorieLog } from '../../types/calorie';
import type { DailyScore, UserStats } from '../../types/gamification';

export function DashboardPage() {
  const [log, setLog] = useState<CalorieLog | null>(null);
  const [score, setScore] = useState<DailyScore | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [logRes, scoreRes, statsRes] = await Promise.allSettled([
        caloriesApi.getToday(),
        gamificationApi.getDailyScore(),
        gamificationApi.getStats(),
      ]);
      if (logRes.status === 'fulfilled') setLog(logRes.value.data);
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => { try { await caloriesApi.deleteEntry(id); await fetchData(); } catch {} };
  const handleToggleFavorite = async (id: string) => { try { await foodApi.toggleFavorite(id); await fetchData(); } catch {} };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-32 mx-auto" />
        <div className="skeleton h-48 w-48 mx-auto rounded-full" />
        <div className="skeleton h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="glass-card p-6 text-center">
          <p className="text-[var(--color-danger)]">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-[var(--color-primary)] font-medium">Retry</button>
        </div>
      </div>
    );
  }

  if (!log) return null;

  const mealGroups = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  const mealIcons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{log.log_date}</p>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.current_streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1">
              <Flame size={13} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{stats.current_streak}</span>
            </div>
          )}
          {stats && (
            <div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1">
              <Trophy size={13} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400">Lv.{stats.level}</span>
            </div>
          )}
        </div>
      </div>

      {/* Score Card */}
      {score && score.total_score > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-yellow-400" />
              <span className="text-sm font-semibold">{score.message}</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-[var(--color-primary)]">{score.total_score}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">pts</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{score.encouragement}</p>
        </div>
      )}

      {/* Progress Ring */}
      <div className="flex flex-col items-center">
        <ProgressRing consumed={log.consumed_kcal} target={log.target_kcal} size={190} />
        <div className="mt-4 grid grid-cols-3 gap-6 w-full max-w-xs">
          {[
            { label: 'Target', value: Math.round(log.target_kcal) },
            { label: 'Eaten', value: Math.round(log.consumed_kcal) },
            { label: 'Left', value: Math.round(log.remaining_kcal), colored: true },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.colored ? (log.remaining_kcal >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]') : ''}`}>
                {item.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Macros */}
      {log.entries.length > 0 && (
        <div className="glass-card p-3">
          <div className="grid grid-cols-3 divide-x divide-[var(--color-surface-border)]">
            {[
              { key: 'protein_g', label: 'Protein', color: '#3b82f6' },
              { key: 'carbs_g', label: 'Carbs', color: '#f59e0b' },
              { key: 'fat_g', label: 'Fat', color: '#ef4444' },
            ].map(({ key, label, color }) => {
              const total = log.entries.reduce((s, e) => s + (Number((e as any)[key]) || 0), 0);
              return (
                <div key={key} className="text-center px-2">
                  <div className="text-base font-bold" style={{ color }}>{Math.round(total)}g</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/log/photo" className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
          <Camera size={16} /> Photo / Text
        </Link>
        <Link to="/log/manual" className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm no-underline">
          <PenLine size={16} /> Manual Log
        </Link>
      </div>

      {/* Meals */}
      <div className="space-y-4 stagger-children">
        {mealGroups.map((type) => {
          const entries = log.entries.filter((e) => e.meal_type === type);
          if (!entries.length) return null;
          const cal = entries.reduce((s, e) => s + e.calories, 0);
          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold capitalize text-[var(--color-text-secondary)]">
                  {mealIcons[type]} {type}
                </h3>
                <span className="text-xs text-[var(--color-text-muted)]">{Math.round(cal)} kcal</span>
              </div>
              <div className="space-y-2">
                {entries.map((e) => <FoodCard key={e.id} entry={e} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />)}
              </div>
            </div>
          );
        })}
        {log.entries.length === 0 && (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="font-medium text-[var(--color-text-secondary)]">No meals logged yet</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Snap a photo or describe your food to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
