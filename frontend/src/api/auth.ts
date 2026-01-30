import apiClient from './client';
import type { LoginRequest, RegisterRequest, TokenResponse } from '../types/auth';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<TokenResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/api/v1/auth/reset-password', { token, new_password: newPassword }),
};
