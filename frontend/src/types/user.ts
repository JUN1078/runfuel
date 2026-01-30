export type Goal = 'deficit' | 'performance' | 'bulking';
export type Gender = 'male' | 'female' | 'other';
export type RunningFrequency = '1-2' | '3-4' | '5-6' | '7+';
export type TrainingIntensity = 'easy' | 'moderate' | 'hard' | 'very_hard';

export interface UserProfile {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  running_frequency: RunningFrequency;
  training_intensity: TrainingIntensity;
  goal: Goal;
  bmr: number | null;
  tdee: number | null;
  daily_target_kcal: number | null;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  has_profile: boolean;
  profile: UserProfile | null;
}

export interface ProfileFormData {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  running_frequency: RunningFrequency;
  training_intensity: TrainingIntensity;
  goal: Goal;
}
