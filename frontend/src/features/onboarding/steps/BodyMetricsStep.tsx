import type { ProfileFormData, Gender } from '../../../types/user';

interface Props {
  data: ProfileFormData;
  onChange: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export function BodyMetricsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Gender</label>
        <div className="flex gap-2">
          {genderOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('gender', opt.value)}
              className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
                data.gender === opt.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Age</label>
        <input
          type="number"
          value={data.age}
          onChange={(e) => onChange('age', parseInt(e.target.value) || 0)}
          min={13}
          max={120}
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Height (cm)</label>
        <input
          type="number"
          value={data.height_cm}
          onChange={(e) => onChange('height_cm', parseFloat(e.target.value) || 0)}
          step="0.1"
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Weight (kg)</label>
        <input
          type="number"
          value={data.weight_kg}
          onChange={(e) => onChange('weight_kg', parseFloat(e.target.value) || 0)}
          step="0.1"
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
