export type SessionType =
  | 'easy_run' | 'tempo' | 'interval' | 'long_run' | 'recovery'
  | 'rest' | 'strength' | 'cross_training' | 'race' | 'trail';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type RaceCategory = '5k' | '10k' | 'half_marathon' | 'marathon' | 'ultra_50k' | 'ultra_100k' | 'trail' | 'other';
export type RaceStatus = 'upcoming' | 'completed' | 'dns' | 'dnf';

export interface TrainingSession {
  id: string;
  session_date: string;
  week_number: number;
  day_of_week: DayOfWeek;
  time_of_day: 'morning' | 'evening';
  session_type: SessionType;
  description: string | null;
  target_distance_km: number | null;
  actual_distance_km: number | null;
  target_duration_min: number | null;
  actual_duration_min: number | null;
  elevation_gain_m: number | null;
  completed: boolean;
  notes: string | null;
}

export interface TrainingPlan {
  id: string;
  name: string;
  race_id: string | null;
  start_date: string;
  end_date: string;
  weeks: number;
  source: 'manual' | 'ai_generated';
  is_active: boolean;
  sessions: TrainingSession[];
  created_at: string;
}

export interface Race {
  id: string;
  name: string;
  race_date: string;
  category: RaceCategory | null;
  distance_km: number | null;
  elevation_gain_m: number | null;
  cutoff_time: string | null;
  mountain_level: string | null;
  start_time: string | null;
  race_type: string | null;
  target_time: string | null;
  actual_time: string | null;
  location: string | null;
  status: RaceStatus;
  notes: string | null;
  created_at: string;
}

export interface GeneratePlanRequest {
  race_id?: string;
  race_name?: string;
  race_date?: string;
  race_distance_km?: number;
  target_time?: string;
  weeks?: number;
  current_weekly_km?: number;
  elevation_gain?: number;
  best_5k?: string;
  best_10k?: string;
  best_half?: string;
  best_marathon?: string;
  avg_long_run?: number;
}
