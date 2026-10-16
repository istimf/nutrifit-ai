import type { UserProfile, ActivityLevel } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // Peu ou pas d'exercice (travail de bureau)
  light: 1.375,         // Exercice léger 1 à 3 fois / semaine
  moderate: 1.55,       // Exercice modéré 3 à 5 fois / semaine
  very_active: 1.725,   // Exercice soutenu 6 à 7 fois / semaine
  extra_active: 1.9,    // Athlète ou travail physique très intense
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { title: string; desc: string }> = {
  sedentary: { title: 'Sédentaire', desc: 'Bureau, déplacements minimes' },
  light: { title: 'Légèrement actif', desc: '1 à 3 séances légères / semaine' },
  moderate: { title: 'Modérément actif', desc: '3 à 5 séances / semaine' },
  very_active: { title: 'Très actif', desc: 'Entraînement quotidien soutenu' },
  extra_active: { title: 'Extrêmement actif', desc: 'Athlète ou métier très physique' },
};

/**
 * Calcul du Métabolisme de Base (BMR) selon la formule de Mifflin-St Jeor (la plus fiable validée cliniquement)
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'female' | 'male' | 'other'): number {
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  } else {
    // Pour homme ou other (formule standard)
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
}

/**
 * Calcul de la Dépense Énergétique Journalière Totale de Maintien (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calcule le budget calorique quotidien optimal pour maintenir le poids idéal
 */
export function calculateIdealMaintenanceCalories(profile: UserProfile): number {
  // BMR calculé avec le poids idéal cible
  const idealBMR = calculateBMR(profile.targetWeightKg, profile.heightCm, profile.age, profile.gender);
  const idealTDEE = calculateTDEE(idealBMR, profile.activityLevel);

  if (profile.goal === 'gentle_loss') {
    // Si l'utilisateur est au-dessus et vise une perte douce de graisse pour atteindre son poids idéal : -350 kcal/jour
    return Math.max(1200, Math.round(idealTDEE - 350));
  } else if (profile.goal === 'gentle_gain') {
    return Math.round(idealTDEE + 300);
  }
  // Maintien strict
  return idealTDEE;
}

/**
 * Calcule la dépense BMR écoulée jusqu'à l'heure actuelle de la journée
 */
export function getBmrBurnedSoFar(dailyBmr: number): number {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const fractionOfDay = Math.min(1, Math.max(0, minutesSinceMidnight / 1440));
  return Math.round(dailyBmr * fractionOfDay);
}

/**
 * Calcule l'effort physique nécessaire (en kcal et en minutes par sport)
 * pour ramener la balance calorique à l'équilibre idéal
 */
export function computeRequiredEffort(
  caloriesConsumed: number,
  activeCaloriesBurned: number,
  dailyBudget: number,
  userWeightKg: number
) {
  // Dépense totale prévue pour maintenir le poids
  // Si le total consommé dépasse le budget autorisé (ajusté des calories déjà brûlées activement)
  const netEnergyIntake = caloriesConsumed - activeCaloriesBurned;
  const surplusKcal = Math.max(0, netEnergyIntake - dailyBudget);

  // Conversion en temps d'effort selon le poids de l'individu (METs)
  // Marche vive (5.5 km/h, MET ~ 4.3): kcal/min = (MET * 3.5 * weightKg) / 200
  const walkKcalPerMin = Math.max(3, (4.3 * 3.5 * userWeightKg) / 200);
  // Course à pied (9 km/h, MET ~ 8.8):
  const runKcalPerMin = Math.max(6, (8.8 * 3.5 * userWeightKg) / 200);
  // Vélo modéré (MET ~ 6.8):
  const bikeKcalPerMin = Math.max(5, (6.8 * 3.5 * userWeightKg) / 200);
  // Natation (MET ~ 7.0):
  const swimKcalPerMin = Math.max(5.5, (7.0 * 3.5 * userWeightKg) / 200);

  const targetBurn = surplusKcal > 0 ? surplusKcal : Math.max(0, 300 - activeCaloriesBurned);

  return {
    surplusKcal,
    targetBurnKcal: Math.round(targetBurn),
    walkMinutes: Math.round(targetBurn / walkKcalPerMin),
    runMinutes: Math.round(targetBurn / runKcalPerMin),
    bikeMinutes: Math.round(targetBurn / bikeKcalPerMin),
    swimMinutes: Math.round(targetBurn / swimKcalPerMin),
  };
}
