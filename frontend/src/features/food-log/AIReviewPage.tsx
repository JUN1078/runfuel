import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, ArrowLeft, AlertTriangle, ShieldCheck, ShieldAlert, ShieldMinus, Lightbulb } from 'lucide-react';
import { useFoodLogStore } from '../../store/foodLogStore';
import { foodApi } from '../../api/food';
import type { MealType, HealthRating } from '../../types/food';

const healthConfig: Record<string, { label: string; color: string; bg: string; icon: typeof ShieldCheck }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
  average: { label: 'Average', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ShieldMinus },
  unhealthy: { label: 'Unhealthy', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
};

function HealthBadge({ rating, size = 'sm' }: { rating?: HealthRating; size?: 'sm' | 'lg' }) {
  if (!rating) return null;
  const config = healthConfig[rating];
  if (!config) return null;
  const Icon = config.icon;

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${config.bg}`}>
        <Icon size={18} className={config.color} />
        <span className={`text-sm font-normal ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

export function AIReviewPage() {
  const navigate = useNavigate();
  const { analysisResult, updateItem, removeItem, reset } = useFoodLogStore();
  const [mealType, setMealType] = useState<MealType>(
    (analysisResult as any)?._mealType || 'lunch'
  );
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
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <button onClick={() => { reset(); navigate('/log/photo'); }} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-light tracking-tight">Review Analysis</h1>
      </div>

      {/* Health evaluation + tip */}
      {analysisResult.health_evaluation && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Meal Health</span>
            <HealthBadge rating={analysisResult.health_evaluation} size="lg" />
          </div>
          {analysisResult.health_tip && (
            <div className="flex items-start gap-2 rounded-lg bg-[var(--color-surface)] p-3">
              <Lightbulb size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{analysisResult.health_tip}</p>
            </div>
          )}
        </div>
      )}

      {analysisResult.meal_notes && !analysisResult.health_evaluation && (
        <div className="glass-card p-3 text-sm text-blue-300 border-blue-500/20">
          {analysisResult.meal_notes}
        </div>
      )}

      {/* Meal type selector */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`rounded-xl py-2.5 text-xs font-medium transition-all ${
                mealType === type
                  ? 'bg-[var(--color-primary)] text-[#0B1C22] shadow-[0_2px_8px_rgba(94,212,198,0.25)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="block text-base">{mealEmoji[type]}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food items */}
      <div className="space-y-2.5 stagger-children">
        {analysisResult.items.map((item, index) => (
          <div key={index} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                    className="w-full bg-transparent font-normal outline-none border-none p-0"
                  />
                  <HealthBadge rating={item.health_rating} />
                </div>
                <input
                  value={item.portion}
                  onChange={(e) => updateItem(index, { ...item, portion: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm text-[var(--color-text-muted)] outline-none border-none p-0"
                />
                {(item.protein_g || item.carbs_g || item.fat_g) && (
                  <div className="mt-2 flex gap-3 text-[10px] text-[var(--color-text-muted)]">
                    {item.protein_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />P {item.protein_g}g</span>}
                    {item.carbs_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />C {item.carbs_g}g</span>}
                    {item.fat_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />F {item.fat_g}g</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => updateItem(index, { ...item, calories: parseFloat(e.target.value) || 0 })}
                  className="w-20 rounded-lg bg-[var(--color-surface-light)] px-2 py-1 text-right text-[var(--color-primary)] font-light outline-none border-none"
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
        <span className="font-normal">Total</span>
        <span className="text-xl font-light text-[var(--color-primary)]">
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
