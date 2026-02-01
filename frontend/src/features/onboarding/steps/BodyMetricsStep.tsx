import type { ProfileFormData, Gender } from '../../../types/user';

interface Props {
  data: ProfileFormData;
  onChange: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
}

const genderOptions: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '🙋‍♂️' },
  { value: 'female', label: 'Female', emoji: '🙋‍♀️' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

export function BodyMetricsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Gender</label>
        <div className="flex gap-2">
          {genderOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('gender', opt.value)}
              className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all ${
                data.gender === opt.value
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Age</label>
        <input
          type="number"
          value={data.age}
          onChange={(e) => onChange('age', parseInt(e.target.value) || 0)}
          min={13}
          max={120}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Height (cm)</label>
        <input
          type="number"
          value={data.height_cm}
          onChange={(e) => onChange('height_cm', parseFloat(e.target.value) || 0)}
          step="0.1"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Weight (kg)</label>
        <input
          type="number"
          value={data.weight_kg}
          onChange={(e) => onChange('weight_kg', parseFloat(e.target.value) || 0)}
          step="0.1"
        />
      </div>
    </div>
  );
}
