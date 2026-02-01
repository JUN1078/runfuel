import apiClient from './client';
import type { TrainingPlan, TrainingSession, Race, GeneratePlanRequest } from '../types/training';
import type { WeeklyFeedback } from '../types/gamification';

export const trainingApi = {
  // Races
  createRace: (data: Partial<Race>) => apiClient.post<Race>('/api/v1/training/races', data),
  getRaces: () => apiClient.get<Race[]>('/api/v1/training/races'),
  getRace: (id: string) => apiClient.get<Race>(`/api/v1/training/races/${id}`),
  updateRace: (id: string, data: Partial<Race>) => apiClient.put<Race>(`/api/v1/training/races/${id}`, data),
  deleteRace: (id: string) => apiClient.delete(`/api/v1/training/races/${id}`),

  // Training Plans
  createPlan: (data: any) => apiClient.post<TrainingPlan>('/api/v1/training/plans', data),
  getPlans: () => apiClient.get<TrainingPlan[]>('/api/v1/training/plans'),
  getPlan: (id: string) => apiClient.get<TrainingPlan>(`/api/v1/training/plans/${id}`),
  generatePlan: (data: GeneratePlanRequest) => apiClient.post<TrainingPlan>('/api/v1/training/plans/generate', data),

  // Sessions
  updateSession: (id: string, data: Partial<TrainingSession>) =>
    apiClient.put<TrainingSession>(`/api/v1/training/sessions/${id}`, data),
  getWeekSessions: (start: string) =>
    apiClient.get<TrainingSession[]>('/api/v1/training/week', { params: { start } }),

  // Feedback
  generateFeedback: (weekStart?: string) =>
    apiClient.post<WeeklyFeedback>('/api/v1/training/feedback', null, {
      params: weekStart ? { week_start: weekStart } : {},
    }),
};
