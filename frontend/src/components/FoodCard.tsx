import { Trash2, Heart, Camera, Type } from 'lucide-react';
import type { FoodEntry } from '../types/food';

interface FoodCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function FoodCard({ entry, onDelete, onToggleFavorite }: FoodCardProps) {
  const totalMacro = (entry.protein_g || 0) + (entry.carbs_g || 0) + (entry.fat_g || 0);
  const proteinPct = totalMacro > 0 ? ((entry.protein_g || 0) / totalMacro) * 100 : 0;
  const carbsPct = totalMacro > 0 ? ((entry.carbs_g || 0) / totalMacro) * 100 : 0;
  const fatPct = totalMacro > 0 ? ((entry.fat_g || 0) / totalMacro) * 100 : 0;

  return (
    <div className="glass-card p-4 animate-item transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-normal truncate">{entry.food_name}</h4>
            {entry.source === 'ai_photo' && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                <Camera size={9} /> AI
              </span>
            )}
            {entry.source === 'ai_text' && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                <Type size={9} /> AI
              </span>
            )}
          </div>
          {entry.portion_desc && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)] truncate">{entry.portion_desc}</p>
          )}
          {/* Macro bar */}
          {totalMacro > 0 && (
            <div className="mt-2">
              <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-[var(--color-surface-light)]">
                <div className="rounded-full bg-blue-400" style={{ width: `${proteinPct}%` }} />
                <div className="rounded-full bg-amber-400" style={{ width: `${carbsPct}%` }} />
                <div className="rounded-full bg-rose-400" style={{ width: `${fatPct}%` }} />
              </div>
              <div className="mt-1 flex gap-3 text-[10px] text-[var(--color-text-muted)]">
                {entry.protein_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />P {entry.protein_g}g</span>}
                {entry.carbs_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />C {entry.carbs_g}g</span>}
                {entry.fat_g != null && <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />F {entry.fat_g}g</span>}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg font-light text-[var(--color-primary)]">
            {Math.round(entry.calories)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">kcal</span>
          <div className="flex gap-0.5 mt-1">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(entry.id)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              >
                <Heart
                  size={14}
                  className={entry.is_favorite ? 'fill-red-500 text-red-500' : 'text-[var(--color-text-muted)]'}
                />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              >
                <Trash2 size={14} className="text-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
