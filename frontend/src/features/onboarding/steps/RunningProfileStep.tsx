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
        <label className="mb-3 block text-sm font-medium">Running Frequency (per week)</label>
        <div className="grid grid-cols-2 gap-2">
          {frequencyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('running_frequency', opt.value)}
              className={`rounded-xl p-3 text-left transition-colors ${
                data.running_frequency === opt.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)]'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className={`text-xs ${data.running_frequency === opt.value ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium">Training Intensity</label>
        <div className="grid grid-cols-2 gap-2">
          {intensityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('training_intensity', opt.value)}
              className={`rounded-xl p-3 text-left transition-colors ${
                data.training_intensity === opt.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)]'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className={`text-xs ${data.training_intensity === opt.value ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
