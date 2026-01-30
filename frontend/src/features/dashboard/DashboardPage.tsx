import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, PenLine } from 'lucide-react';
import { ProgressRing } from '../../components/ProgressRing';
import { FoodCard } from '../../components/FoodCard';
import { caloriesApi } from '../../api/calories';
import { foodApi } from '../../api/food';
import type { CalorieLog } from '../../types/calorie';

export function DashboardPage() {
  const [log, setLog] = useState<CalorieLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchToday = async () => {
    try {
      const { data } = await caloriesApi.getToday();
      setLog(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleDelete = async (entryId: string) => {
    try {
      await caloriesApi.deleteEntry(entryId);
      await fetchToday();
    } catch {}
  };

  const handleToggleFavorite = async (entryId: string) => {
    try {
      await foodApi.toggleFavorite(entryId);
      await fetchToday();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[var(--color-surface)] p-6 text-center">
        <p className="text-[var(--color-danger)]">{error}</p>
        <button onClick={fetchToday} className="mt-3 text-sm text-[var(--color-primary)]">
          Retry
        </button>
      </div>
    );
  }

  if (!log) return null;

  const statusColor = {
    normal: 'text-[var(--color-primary)]',
    near_limit: 'text-[var(--color-warning)]',
    over: 'text-[var(--color-danger)]',
    under: 'text-[var(--color-warning)]',
  };

  // Group entries by meal type
  const mealGroups = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{log.log_date}</p>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center">
        <ProgressRing consumed={log.consumed_kcal} target={log.target_kcal} size={180} />
        <div className="mt-4 flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold">{Math.round(log.target_kcal)}</div>
            <div className="text-[var(--color-text-muted)]">Target</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{Math.round(log.consumed_kcal)}</div>
            <div className="text-[var(--color-text-muted)]">Consumed</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${statusColor[log.status]}`}>
              {Math.round(log.remaining_kcal)}
            </div>
            <div className="text-[var(--color-text-muted)]">Remaining</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          to="/log/photo"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white"
        >
          <Camera size={18} /> Photo Log
        </Link>
        <Link
          to="/log/manual"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-surface-light)] py-3 font-semibold text-[var(--color-text)]"
        >
          <PenLine size={18} /> Manual Log
        </Link>
      </div>

      {/* Meal List */}
      <div className="space-y-4">
        {mealGroups.map((mealType) => {
          const entries = log.entries.filter((e) => e.meal_type === mealType);
          if (entries.length === 0) return null;
          return (
            <div key={mealType}>
              <h3 className="mb-2 text-sm font-medium capitalize text-[var(--color-text-muted)]">
                {mealType}
              </h3>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <FoodCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {log.entries.length === 0 && (
          <div className="rounded-xl bg-[var(--color-surface)] p-8 text-center">
            <p className="text-[var(--color-text-muted)]">No meals logged yet today.</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Tap "Photo Log" or "Manual Log" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
