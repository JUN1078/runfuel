import apiClient from './client';
import type { CalorieLog, CalorieLogSummary } from '../types/calorie';
import type { FoodEntry } from '../types/food';

export const caloriesApi = {
  getToday: () =>
    apiClient.get<CalorieLog>('/api/v1/calories/today'),

  getByDate: (date: string) =>
    apiClient.get<CalorieLog>(`/api/v1/calories/date/${date}`),

  getRange: (start: string, end: string) =>
    apiClient.get<CalorieLogSummary[]>('/api/v1/calories/range', {
      params: { start, end },
    }),

  updateEntry: (entryId: string, data: Partial<FoodEntry>) =>
    apiClient.put<FoodEntry>(`/api/v1/calories/entry/${entryId}`, data),

  deleteEntry: (entryId: string) =>
    apiClient.delete(`/api/v1/calories/entry/${entryId}`),
};
