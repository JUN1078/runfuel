export interface WeeklySummary {
  period_start: string;
  period_end: string;
  avg_intake_kcal: number | null;
  avg_target_kcal: number | null;
  total_intake_kcal: number | null;
  days_on_target: number;
  days_logged: number;
  consistency_score: number | null;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export interface ConsistencyData {
  score: number;
  days_on_target: number;
  total_days: number;
  period: string;
}
