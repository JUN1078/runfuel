import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { foodApi } from '../../api/food';
import type { MealType } from '../../types/food';

export function ManualEntryPage() {
  const navigate = useNavigate();
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    setLoading(true);
    setError('');

    try {
      await foodApi.manualEntry({
        meal_type: mealType,
        food_name: foodName,
        portion_desc: portion || undefined,
        calories: parseFloat(calories),
        protein_g: protein ? parseFloat(protein) : undefined,
        carbs_g: carbs ? parseFloat(carbs) : undefined,
        fat_g: fat ? parseFloat(fat) : undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/dashboard')} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Manual Food Entry</h1>
      </div>

      {/* Meal type */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(type)}
              className={`rounded-xl py-2.5 text-xs font-medium transition-all ${
                mealType === type
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="block text-base">{mealEmoji[type]}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food details */}
      <div className="glass-card p-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Food Name *</label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            placeholder="e.g. Grilled chicken breast"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Portion</label>
          <input
            type="text"
            value={portion}
            onChange={(e) => setPortion(e.target.value)}
            placeholder="e.g. 150g, 1 cup"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Calories *</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            min="0"
            step="0.1"
            placeholder="e.g. 250"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="glass-card p-4">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Macros (optional)</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              <label className="text-xs text-[var(--color-text-muted)]">Protein (g)</label>
            </div>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <label className="text-xs text-[var(--color-text-muted)]">Carbs (g)</label>
            </div>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
              <label className="text-xs text-[var(--color-text-muted)]">Fat (g)</label>
            </div>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex-1 py-3 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !foodName || !calories}
          className="btn-primary flex flex-1 items-center justify-center gap-2 py-3 text-sm"
        >
          <Check size={18} /> {loading ? 'Saving...' : 'Add to Log'}
        </button>
      </div>
    </form>
  );
}
