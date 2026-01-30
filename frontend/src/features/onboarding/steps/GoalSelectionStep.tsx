import { Flame, Zap, Dumbbell } from 'lucide-react';
import type { ProfileFormData, Goal } from '../../../types/user';

interface Props {
  data: ProfileFormData;
  onChange: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
}

const goalOptions: { value: Goal; label: string; desc: string; detail: string; icon: typeof Flame }[] = [
  {
    value: 'deficit',
    label: 'Fat Loss',
    desc: '-400 kcal/day',
    detail: 'Lose body fat while maintaining running performance. Smart deficit with safety guards on long run days.',
    icon: Flame,
  },
  {
    value: 'performance',
    label: 'Performance',
    desc: 'Maintenance',
    detail: 'Fuel your training optimally. No surplus or deficit — eat to run your best.',
    icon: Zap,
  },
  {
    value: 'bulking',
    label: 'Muscle Gain',
    desc: '+400 kcal/day',
    detail: 'Build muscle mass with a controlled surplus alongside your running program.',
    icon: Dumbbell,
  },
];

export function GoalSelectionStep({ data, onChange }: Props) {
  return (
    <div className="space-y-3">
      {goalOptions.map((opt) => {
        const Icon = opt.icon;
        const selected = data.goal === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange('goal', opt.value)}
            className={`w-full rounded-xl p-4 text-left transition-all ${
              selected
                ? 'bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text)] ring-1 ring-transparent hover:ring-[var(--color-surface-light)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={24} />
              <div>
                <div className="font-semibold">{opt.label}</div>
                <div className={`text-xs ${selected ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.desc}
                </div>
              </div>
            </div>
            <p className={`mt-2 text-sm ${selected ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
              {opt.detail}
            </p>
          </button>
        );
      })}
    </div>
  );
}
