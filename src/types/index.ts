export interface User {
  id: number;
  name: string;
  email: string;
  daily_calorie_goal: number;
  created_at: string;
}

export interface CalorieLog {
  id: number;
  user_id: number;
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  via: string;
  log_date: string;
  notes: string | null;
  created_at: string;
}

export interface DailySummary {
  log_date: string;
  total_calories: number;
  meal_count: number;
}

export interface MealAnalysisResult {
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
