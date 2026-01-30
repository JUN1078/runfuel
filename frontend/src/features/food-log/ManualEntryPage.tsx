import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">Manual Food Entry</h1>

      <div>
        <label className="mb-2 block text-sm text-[var(--color-text-muted)]">Meal Type</label>
        <div className="flex gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(type)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize ${
                mealType === type
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Food Name *</label>
        <input
          type="text"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
          placeholder="e.g. Grilled chicken breast"
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Portion</label>
        <input
          type="text"
          value={portion}
          onChange={(e) => setPortion(e.target.value)}
          placeholder="e.g. 150g, 1 cup"
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Calories *</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
          min="0"
          step="0.1"
          placeholder="e.g. 250"
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Protein (g)</label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Carbs (g)</label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Fat (g)</label>
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex-1 rounded-xl border border-[var(--color-surface-light)] py-3 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !foodName || !calories}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white disabled:opacity-50"
        >
          <Check size={18} /> {loading ? 'Saving...' : 'Add to Log'}
        </button>
      </div>
    </form>
  );
}
