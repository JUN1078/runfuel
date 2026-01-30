import { create } from 'zustand';
import type { FoodItemAI } from '../types/food';

interface FoodLogState {
  analysisResult: { items: FoodItemAI[]; total_calories: number; meal_notes: string } | null;
  selectedPhoto: File | null;
  isAnalyzing: boolean;
  setAnalysisResult: (result: { items: FoodItemAI[]; total_calories: number; meal_notes: string } | null) => void;
  setSelectedPhoto: (photo: File | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  updateItem: (index: number, item: FoodItemAI) => void;
  removeItem: (index: number) => void;
  reset: () => void;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  analysisResult: null,
  selectedPhoto: null,
  isAnalyzing: false,
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
  setSelectedPhoto: (selectedPhoto) => set({ selectedPhoto }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  updateItem: (index, item) =>
    set((state) => {
      if (!state.analysisResult) return state;
      const items = [...state.analysisResult.items];
      items[index] = item;
      const total_calories = items.reduce((sum, i) => sum + i.calories, 0);
      return { analysisResult: { ...state.analysisResult, items, total_calories } };
    }),
  removeItem: (index) =>
    set((state) => {
      if (!state.analysisResult) return state;
      const items = state.analysisResult.items.filter((_, i) => i !== index);
      const total_calories = items.reduce((sum, i) => sum + i.calories, 0);
      return { analysisResult: { ...state.analysisResult, items, total_calories } };
    }),
  reset: () => set({ analysisResult: null, selectedPhoto: null, isAnalyzing: false }),
}));
