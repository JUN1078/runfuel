export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;
  xp_reward: number;
}

export interface UserBadgeInfo {
  badge: Badge;
  earned_at: string | null;
  earned: boolean;
}

export interface UserStats {
  total_xp: number;
  level: number;
  xp_for_next_level: number;
  xp_progress: number;
  current_streak: number;
  longest_streak: number;
  total_logs: number;
  total_photos: number;
  perfect_weeks: number;
  days_on_target: number;
}

export interface DailyScore {
  date: string;
  calorie_score: number;
  logging_bonus: number;
  streak_bonus: number;
  total_score: number;
  message: string;
  encouragement: string;
}

export interface WeeklyFeedback {
  id: string;
  week_start: string;
  week_end: string;
  nutrition_score: number;
  training_score: number;
  overall_score: number;
  nutrition_feedback: string | null;
  training_feedback: string | null;
  ai_suggestions: string | null;
  highlights: string | null;
  created_at: string;
}
