import apiClient from './client';
import type { WeeklySummary, StreakData, ConsistencyData } from '../types/progress';

export const progressApi = {
  getWeekly: (date?: string) =>
    apiClient.get<WeeklySummary>('/api/v1/progress/weekly', {
      params: date ? { date } : undefined,
    }),

  getMonthly: (month: number, year: number) =>
    apiClient.get<WeeklySummary>('/api/v1/progress/monthly', {
      params: { month, year },
    }),

  getStreak: () =>
    apiClient.get<StreakData>('/api/v1/progress/streak'),

  getConsistency: (period: string = '30d') =>
    apiClient.get<ConsistencyData>('/api/v1/progress/consistency', {
      params: { period },
    }),
};
