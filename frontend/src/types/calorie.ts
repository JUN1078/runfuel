import type { FoodEntry } from './food';

export type LogStatus = 'normal' | 'near_limit' | 'over' | 'under';

export interface CalorieLog {
  id: string;
  log_date: string;
  target_kcal: number;
  consumed_kcal: number;
  remaining_kcal: number;
  status: LogStatus;
  entries: FoodEntry[];
}

export interface CalorieLogSummary {
  log_date: string;
  target_kcal: number;
  consumed_kcal: number;
  remaining_kcal: number;
  status: LogStatus;
}
