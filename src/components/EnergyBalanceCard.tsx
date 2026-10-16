import React from 'react';
import { Flame, TrendingDown, TrendingUp, Sparkles, AlertCircle, CheckCircle, PieChart } from 'lucide-react';
import type { UserProfile, MealItem, GoogleFitActivityData } from '../types';
import { getBmrBurnedSoFar } from '../utils/nutritionCalculations';

interface EnergyBalanceCardProps {
  profile: UserProfile;
  meals: MealItem[];
  fitData: GoogleFitActivityData;
  onOpenScanner: () => void;
}

export const EnergyBalanceCard: React.FC<EnergyBalanceCardProps> = ({
  profile,
  meals,
  fitData,
  onOpenScanner,
}) => {
  // Calculs totaux des repas consommés
  const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + m.macros.protein, 0));
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + m.macros.carbs, 0));
  const totalFat = Math.round(meals.reduce((sum, m) => sum + m.macros.fat, 0));
  const totalFiber = Math.round(meals.reduce((sum, m) => sum + m.macros.fiber, 0));

  // Calories actives Google Fit
  const activeCalories = fitData.activeCalories;

  // Dépense BMR estimée jusqu'à maintenant
  const bmrSoFar = getBmrBurnedSoFar(profile.bmr);

  // Total brûlé (BMR au prorata + sport/pas actifs)
  const totalBurnedSoFar = bmrSoFar + activeCalories;

  // Solde net par rapport au budget journalier
  // Net intake = calories consommées - calories d'exercice
  const netIntake = totalCaloriesConsumed - activeCalories;
  const remainingBudget = profile.dailyCalorieTarget - netIntake;

  // Pourcentage du budget utilisé
  const percentUsed = Math.min(130, Math.round((netIntake / Math.max(1, profile.dailyCalorieTarget)) * 100));

  // Statut de la balance pour le poids idéal
  let balanceStatus: 'ideal' | 'safe_deficit' | 'moderate_surplus' | 'high_surplus' = 'ideal';
  if (remainingBudget >= 0 && remainingBudget <= 300) {
    balanceStatus = 'ideal';
  } else if (remainingBudget > 300) {
    balanceStatus = 'safe_deficit';
  } else if (remainingBudget >= -300) {
    balanceStatus = 'moderate_surplus';
  } else {
    balanceStatus = 'high_surplus';
  }

  // Objectifs indicatifs en macronutriments pour le poids cible
  // Protéines recommandées : ~1.6g / kg de poids cible
  const targetProteinGrams = Math.round(profile.targetWeightKg * 1.6);
  // Glucides : ~45% des calories (4 kcal/g)
  const targetCarbsGrams = Math.round((profile.dailyCalorieTarget * 0.45) / 4);
  // Lipides : ~25% des calories (9 kcal/g)
  const targetFatGrams = Math.round((profile.dailyCalorieTarget * 0.25) / 9);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Flame className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Balance Énergétique du Jour
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintien de votre poids idéal ({profile.targetWeightKg} kg) • Activité Google Fit synchronisée
          </p>
        </div>

        <div className="flex items-center gap-3">
          {balanceStatus === 'ideal' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Équilibre idéal atteint !</span>
            </div>
          )}
          {balanceStatus === 'safe_deficit' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              <span>Budget disponible (+{remainingBudget} kcal)</span>
            </div>
          )}
          {balanceStatus === 'moderate_surplus' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Léger surplus ({Math.abs(remainingBudget)} kcal à éliminer)</span>
            </div>
          )}
          {balanceStatus === 'high_surplus' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>Surplus net ({Math.abs(remainingBudget)} kcal à compenser)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Calories 3-Way Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Calories Consommées */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-b from-amber-50/60 to-orange-50/30 border border-amber-200/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
            <span>Repas Consommés</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">
              {meals.length} repas
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
              {totalCaloriesConsumed}
            </span>
            <span className="text-sm font-semibold text-amber-700">kcal</span>
          </div>
          <p className="text-xs text-amber-700/80 mt-1">
            Total scanné aujourd'hui
          </p>
        </div>

        {/* Calories Brûlées Google Fit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-b from-teal-50/60 to-emerald-50/30 border border-teal-200/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
            <span>Activité Google Fit</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-semibold">
              {fitData.steps.toLocaleString()} pas
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-teal-950 tracking-tight">
              -{activeCalories}
            </span>
            <span className="text-sm font-semibold text-teal-700">kcal</span>
          </div>
          <p className="text-xs text-teal-700/80 mt-1">
            Dépense active (marche, sport)
          </p>
        </div>

        {/* Solde & Reste pour maintien */}
        <div className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
          remainingBudget >= 0
            ? 'bg-linear-to-b from-emerald-50/80 to-teal-50/30 border-emerald-200'
            : 'bg-linear-to-b from-rose-50/80 to-orange-50/30 border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className={remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
              {remainingBudget >= 0 ? 'Budget Restant' : 'Surplus à Brûler'}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              remainingBudget >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}>
              Cible: {profile.dailyCalorieTarget} kcal
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
              remainingBudget >= 0 ? 'text-emerald-950' : 'text-rose-950'
            }`}>
              {remainingBudget >= 0 ? remainingBudget : Math.abs(remainingBudget)}
            </span>
            <span className={`text-sm font-semibold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              kcal
            </span>
          </div>
          <p className={`text-xs mt-1 ${remainingBudget >= 0 ? 'text-emerald-700/80' : 'text-rose-700/80'}`}>
            {remainingBudget >= 0 ? 'pour maintenir votre poids' : 'effort physique conseillé'}
          </p>
        </div>
      </div>

      {/* Progress Bar of Daily Target */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Progression du budget calorique net</span>
          <span className="font-bold text-slate-900">{percentUsed}% utilisé</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              percentUsed > 105
                ? 'bg-linear-to-r from-amber-500 to-rose-500'
                : percentUsed > 90
                ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                : 'bg-linear-to-r from-teal-400 to-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>

      {/* Macronutrient breakdown */}
      <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Macronutriments consommés
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Objectifs pour {profile.targetWeightKg} kg
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Protéines */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-rose-700">Protéines</span>
              <span className="text-[11px] text-slate-400">/ {targetProteinGrams}g</span>
            </div>
            <div className="text-lg font-black text-slate-900">{totalProtein}g</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${Math.min(100, (totalProtein / Math.max(1, targetProteinGrams)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Glucides */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-amber-700">Glucides</span>
              <span className="text-[11px] text-slate-400">/ {targetCarbsGrams}g</span>
            </div>
            <div className="text-lg font-black text-slate-900">{totalCarbs}g</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (totalCarbs / Math.max(1, targetCarbsGrams)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Lipides */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-blue-700">Lipides</span>
              <span className="text-[11px] text-slate-400">/ {targetFatGrams}g</span>
            </div>
            <div className="text-lg font-black text-slate-900">{totalFat}g</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (totalFat / Math.max(1, targetFatGrams)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fibres */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-emerald-700">Fibres</span>
              <span className="text-[11px] text-slate-400">/ 30g</span>
            </div>
            <div className="text-lg font-black text-slate-900">{totalFiber}g</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (totalFiber / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
