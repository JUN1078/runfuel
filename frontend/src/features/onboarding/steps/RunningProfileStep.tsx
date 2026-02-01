import type { ProfileFormData, RunningFrequency, TrainingIntensity } from '../../../types/user';

interface Props {
  data: ProfileFormData;
  onChange: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
}

const frequencyOptions: { value: RunningFrequency; label: string; desc: string }[] = [
  { value: '1-2', label: '1-2 days', desc: 'Light runner' },
  { value: '3-4', label: '3-4 days', desc: 'Regular runner' },
  { value: '5-6', label: '5-6 days', desc: 'Serious runner' },
  { value: '7+', label: '7+ days', desc: 'Daily runner' },
];

const intensityOptions: { value: TrainingIntensity; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Conversational pace' },
  { value: 'moderate', label: 'Moderate', desc: 'Comfortably hard' },
  { value: 'hard', label: 'Hard', desc: 'Tempo & intervals' },
  { value: 'very_hard', label: 'Very Hard', desc: 'Race-level effort' },
];

export function RunningProfileStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Running Frequency (per week)</label>
        <div className="grid grid-cols-2 gap-2">
          {frequencyOptions.map((opt) => {
            const selected = data.running_frequency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('running_frequency', opt.value)}
                className={`rounded-xl p-3 text-left transition-all ${
                  selected
                    ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className={`text-xs ${selected ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Training Intensity</label>
        <div className="grid grid-cols-2 gap-2">
          {intensityOptions.map((opt) => {
            const selected = data.training_intensity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('training_intensity', opt.value)}
                className={`rounded-xl p-3 text-left transition-all ${
                  selected
                    ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className={`text-xs ${selected ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
