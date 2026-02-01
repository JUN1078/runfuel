export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodSource = 'ai_photo' | 'ai_text' | 'manual' | 'search' | 'favorite';
export type HealthRating = 'healthy' | 'average' | 'unhealthy';

export interface FoodItemAI {
  name: string;
  portion: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  confidence: number;
  health_rating?: HealthRating;
}

export interface AIAnalysisResponse {
  items: FoodItemAI[];
  total_calories: number;
  meal_notes: string;
  health_evaluation?: HealthRating;
  health_tip?: string;
}

export interface FoodEntry {
  id: string;
  meal_type: MealType;
  source: FoodSource;
  food_name: string;
  portion_desc: string | null;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  photo_url: string | null;
  ai_confidence: number | null;
  is_favorite: boolean;
  created_at: string;
}

export interface ManualFoodEntry {
  meal_type: MealType;
  food_name: string;
  portion_desc?: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

export interface ConfirmAnalysisRequest {
  meal_type: MealType;
  items: FoodItemAI[];
  photo_url?: string;
  ai_raw_response?: Record<string, unknown>;
}
