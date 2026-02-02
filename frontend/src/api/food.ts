import apiClient from './client';
import type { AIAnalysisResponse, FoodEntry, ManualFoodEntry, ConfirmAnalysisRequest } from '../types/food';

export const foodApi = {
  analyzePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post<AIAnalysisResponse>('/api/v1/food/analyze-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },

  analyzeText: (description: string) =>
    apiClient.post<AIAnalysisResponse>('/api/v1/food/analyze-text', { description }, {
      timeout: 30000,
    }),

  analyzePhotoWithText: (file: File, description: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    return apiClient.post<AIAnalysisResponse>('/api/v1/food/analyze-photo-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000,
    });
  },

  confirmAnalysis: (data: ConfirmAnalysisRequest) =>
    apiClient.post<FoodEntry[]>('/api/v1/food/confirm-analysis', data),

  manualEntry: (data: ManualFoodEntry) =>
    apiClient.post<FoodEntry>('/api/v1/food/manual', data),

  searchFoods: (query: string) =>
    apiClient.get<FoodEntry[]>('/api/v1/food/search', { params: { q: query } }),

  getFavorites: () =>
    apiClient.get<FoodEntry[]>('/api/v1/food/favorites'),

  toggleFavorite: (entryId: string) =>
    apiClient.post<FoodEntry>(`/api/v1/food/favorites/${entryId}`),
};
