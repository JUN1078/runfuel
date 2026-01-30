import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2 } from 'lucide-react';
import { useFoodLogStore } from '../../store/foodLogStore';
import { foodApi } from '../../api/food';
import type { MealType } from '../../types/food';

export function AIReviewPage() {
  const navigate = useNavigate();
  const { analysisResult, updateItem, removeItem, reset } = useFoodLogStore();
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!analysisResult) {
    navigate('/log/photo');
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await foodApi.confirmAnalysis({
        meal_type: mealType,
        items: analysisResult.items,
        ai_raw_response: analysisResult as unknown as Record<string, unknown>,
      });
      reset();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Analysis</h1>

      {analysisResult.meal_notes && (
        <div className="rounded-xl bg-blue-500/10 p-3 text-sm text-blue-300">
          {analysisResult.meal_notes}
        </div>
      )}

      {/* Meal type selector */}
      <div>
        <label className="mb-2 block text-sm text-[var(--color-text-muted)]">Meal Type</label>
        <div className="flex gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
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

      {/* Food items */}
      <div className="space-y-3">
        {analysisResult.items.map((item, index) => (
          <div key={index} className="rounded-xl bg-[var(--color-surface)] p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                  className="w-full bg-transparent font-medium outline-none"
                />
                <input
                  value={item.portion}
                  onChange={(e) => updateItem(index, { ...item, portion: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm text-[var(--color-text-muted)] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => updateItem(index, { ...item, calories: parseFloat(e.target.value) || 0 })}
                  className="w-20 rounded-lg bg-[var(--color-surface-light)] px-2 py-1 text-right text-[var(--color-primary)] outline-none"
                />
                <span className="text-xs text-[var(--color-text-muted)]">kcal</span>
                <button
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-1 hover:bg-[var(--color-surface-light)]"
                >
                  <Trash2 size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
            {item.confidence < 0.7 && (
              <p className="mt-1 text-xs text-[var(--color-warning)]">
                Low confidence ({Math.round(item.confidence * 100)}%) — please verify
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] p-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-[var(--color-primary)]">
          {Math.round(analysisResult.total_calories)} kcal
        </span>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => {
            reset();
            navigate('/log/photo');
          }}
          className="flex-1 rounded-xl border border-[var(--color-surface-light)] py-3 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || analysisResult.items.length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white disabled:opacity-50"
        >
          <Check size={18} /> {loading ? 'Saving...' : 'Confirm & Log'}
        </button>
      </div>
    </div>
  );
}
