import { create } from 'zustand';
import type { CalorieLog } from '../types/calorie';

interface DashboardState {
  todayLog: CalorieLog | null;
  isLoading: boolean;
  error: string | null;
  setTodayLog: (log: CalorieLog) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  todayLog: null,
  isLoading: false,
  error: null,
  setTodayLog: (log) => set({ todayLog: log, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ todayLog: null, isLoading: false, error: null }),
}));
