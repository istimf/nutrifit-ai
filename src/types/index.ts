export type Gender = 'female' | 'male' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';

export interface UserProfile {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: 'maintain' | 'gentle_loss' | 'gentle_gain';
  dailyCalorieTarget: number;
  bmr: number;
}

export interface MacroBreakdown {
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber: number;   // in grams
  sugar?: number;  // in grams
}

export interface IngredientDetail {
  name: string;
  estimatedWeightGrams: number;
  calories: number;
  portionLabel?: string;
}

export interface EffortEquivalents {
  briskWalkMinutes: number;
  runningMinutes: number;
  cyclingMinutes: number;
  swimmingMinutes?: number;
  hiitMinutes?: number;
}

export interface MealItem {
  id: string;
  timestamp: number;
  dishName: string;
  category: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  portionDescription: string;
  portionMultiplier: number;
  totalCalories: number;
  macros: MacroBreakdown;
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  healthScore: number;
  ingredients: IngredientDetail[];
  nutritionalAnalysis: string;
  dietitianTips: string[];
  effortEquivalents: EffortEquivalents;
  imageBase64?: string;
}

export interface GoogleFitActivityData {
  steps: number;
  activeCalories: number;
  totalCaloriesBurned: number;
  activeMinutes: number;
  distanceMeters: number;
  lastSync: number;
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
}

export interface ExerciseOption {
  activityName: string;
  durationMinutes: number;
  intensity: 'Douce' | 'Modérée' | 'Intense';
  expectedBurnKcal: number;
  iconType: 'walk' | 'run' | 'bike' | 'swim' | 'workout';
  tips?: string;
}

export interface CoachRecommendation {
  status: 'on_track' | 'needs_effort' | 'surplus_alert' | 'deficit_recovery';
  headline: string;
  summary: string;
  recommendedEffortKcal: number;
  recommendedStepsToAdd?: number;
  exerciseOptions: ExerciseOption[];
  hydrationAndRecoveryTip: string;
  motivationQuote: string;
}
