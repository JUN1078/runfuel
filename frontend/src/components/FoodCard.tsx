import { Trash2, Heart } from 'lucide-react';
import type { FoodEntry } from '../types/food';

interface FoodCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function FoodCard({ entry, onDelete, onToggleFavorite }: FoodCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{entry.food_name}</h4>
          {entry.source === 'ai_photo' && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
              AI
            </span>
          )}
        </div>
        {entry.portion_desc && (
          <p className="text-sm text-[var(--color-text-muted)]">{entry.portion_desc}</p>
        )}
        <div className="mt-1 flex gap-3 text-xs text-[var(--color-text-muted)]">
          {entry.protein_g != null && <span>P: {entry.protein_g}g</span>}
          {entry.carbs_g != null && <span>C: {entry.carbs_g}g</span>}
          {entry.fat_g != null && <span>F: {entry.fat_g}g</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-[var(--color-primary)]">
          {Math.round(entry.calories)} kcal
        </span>
        <div className="flex gap-1">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(entry.id)}
              className="rounded-lg p-1.5 hover:bg-[var(--color-surface-light)]"
            >
              <Heart
                size={16}
                className={entry.is_favorite ? 'fill-red-500 text-red-500' : 'text-[var(--color-text-muted)]'}
              />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg p-1.5 hover:bg-[var(--color-surface-light)]"
            >
              <Trash2 size={16} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
