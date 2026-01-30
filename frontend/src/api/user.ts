import apiClient from './client';
import type { User, ProfileFormData } from '../types/user';

export const userApi = {
  getMe: () => apiClient.get<User>('/api/v1/users/me'),

  updateProfile: (data: ProfileFormData) =>
    apiClient.put('/api/v1/users/me/profile', data),

  updateGoal: (goal: string) =>
    apiClient.patch('/api/v1/users/me/goal', { goal }),

  deactivate: () => apiClient.delete('/api/v1/users/me'),
};
