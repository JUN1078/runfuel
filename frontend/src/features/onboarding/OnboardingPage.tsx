import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BodyMetricsStep } from './steps/BodyMetricsStep';
import { RunningProfileStep } from './steps/RunningProfileStep';
import { GoalSelectionStep } from './steps/GoalSelectionStep';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { ProfileFormData, Gender, RunningFrequency, TrainingIntensity, Goal } from '../../types/user';

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    age: 25,
    gender: 'male' as Gender,
    height_cm: 170,
    weight_kg: 70,
    running_frequency: '3-4' as RunningFrequency,
    training_intensity: 'moderate' as TrainingIntensity,
    goal: 'performance' as Goal,
  });

  const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.put('/api/v1/users/me/profile', formData);
      if (user) {
        setUser({ ...user, has_profile: true });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <BodyMetricsStep key="body" data={formData} onChange={updateField} />,
    <RunningProfileStep key="running" data={formData} onChange={updateField} />,
    <GoalSelectionStep key="goal" data={formData} onChange={updateField} />,
  ];

  const stepTitles = ['Body Metrics', 'Running Profile', 'Your Goal'];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Set Up Your Profile</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Step {step + 1} of {steps.length}: {stepTitles[step]}
          </p>
          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-light)]'
                }`}
              />
            ))}
          </div>
        </div>

        {steps[step]}

        {error && <p className="mt-4 text-center text-sm text-[var(--color-danger)]">{error}</p>}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-[var(--color-surface-light)] py-3 font-semibold text-[var(--color-text)]"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Start Tracking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
