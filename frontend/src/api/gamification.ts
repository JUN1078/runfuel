import apiClient from './client';
import type { UserStats, UserBadgeInfo, DailyScore } from '../types/gamification';

export const gamificationApi = {
  getStats: () => apiClient.get<UserStats>('/api/v1/gamification/stats'),
  getBadges: () => apiClient.get<UserBadgeInfo[]>('/api/v1/gamification/badges'),
  getDailyScore: (date?: string) =>
    apiClient.get<DailyScore>('/api/v1/gamification/daily-score', { params: date ? { log_date: date } : {} }),
  checkBadges: () => apiClient.post<{ key: string; name: string; description: string; icon: string; xp_reward: number }[]>('/api/v1/gamification/check-badges'),
};
