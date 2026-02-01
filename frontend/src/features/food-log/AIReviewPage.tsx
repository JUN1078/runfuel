import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
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
  const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => { reset(); navigate('/log/photo'); }} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Review Analysis</h1>
      </div>

      {analysisResult.meal_notes && (
        <div className="glass-card p-3 text-sm text-blue-300 border-blue-500/20">
          {analysisResult.meal_notes}
        </div>
      )}

      {/* Meal type selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Meal Type</label>
        <div className="flex gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-all ${
                mealType === type
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {mealEmoji[type]} {type}
            </button>
          ))}
        </div>
      </div>

      {/* Food items */}
      <div className="space-y-2 stagger-children">
        {analysisResult.items.map((item, index) => (
          <div key={index} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                  className="w-full bg-transparent font-semibold outline-none border-none p-0"
                />
                <input
                  value={item.portion}
                  onChange={(e) => updateItem(index, { ...item, portion: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm text-[var(--color-text-muted)] outline-none border-none p-0"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => updateItem(index, { ...item, calories: parseFloat(e.target.value) || 0 })}
                  className="w-20 rounded-lg bg-[var(--color-surface-light)] px-2 py-1 text-right text-[var(--color-primary)] font-bold outline-none border-none"
                />
                <span className="text-[10px] text-[var(--color-text-muted)]">kcal</span>
                <button
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                >
                  <Trash2 size={15} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
            {item.confidence < 0.7 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
                <AlertTriangle size={12} />
                Low confidence ({Math.round(item.confidence * 100)}%) — please verify
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="glass-card flex items-center justify-between p-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-[var(--color-primary)]">
          {Math.round(analysisResult.total_calories)} kcal
        </span>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => { reset(); navigate('/log/photo'); }}
          className="btn-secondary flex-1 py-3 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || analysisResult.items.length === 0}
          className="btn-primary flex flex-1 items-center justify-center gap-2 py-3 text-sm"
        >
          <Check size={18} /> {loading ? 'Saving...' : 'Confirm & Log'}
        </button>
      </div>
    </div>
  );
}
