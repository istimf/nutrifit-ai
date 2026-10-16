import React, { useState } from 'react';
import {
  Activity,
  Footprints,
  Bike,
  Sparkles,
  Timer,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Flame,
  Zap,
  PlusCircle,
} from 'lucide-react';
import type { UserProfile, MealItem, GoogleFitActivityData, CoachRecommendation, ExerciseOption } from '../types';
import { computeRequiredEffort } from '../utils/nutritionCalculations';

interface EffortPrescriptionCardProps {
  profile: UserProfile;
  meals: MealItem[];
  fitData: GoogleFitActivityData;
  onAddSimulatedBurn: (calories: number, steps: number, activityTitle: string) => void;
}

export const EffortPrescriptionCard: React.FC<EffortPrescriptionCardProps> = ({
  profile,
  meals,
  fitData,
  onAddSimulatedBurn,
}) => {
  const [coachData, setCoachData] = useState<CoachRecommendation | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [addedActivity, setAddedActivity] = useState<string | null>(null);

  const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const activeCalories = fitData.activeCalories;

  // Calcul mathématique immédiat basé sur les METs et le poids de la personne
  const effort = computeRequiredEffort(
    totalCaloriesConsumed,
    activeCalories,
    profile.dailyCalorieTarget,
    profile.currentWeightKg
  );

  const handleFetchCoach = async () => {
    setIsLoadingCoach(true);
    setCoachError(null);
    try {
      const netIntake = totalCaloriesConsumed - activeCalories;
      const remainingBudget = profile.dailyCalorieTarget - netIntake;

      const response = await fetch('/api/coach-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCaloriesConsumed: totalCaloriesConsumed,
          caloriesBurnedTotal: fitData.totalCaloriesBurned || (activeCalories + 1400),
          activeCaloriesBurned: activeCalories,
          stepCount: fitData.steps,
          currentWeight: profile.currentWeightKg,
          targetWeight: profile.targetWeightKg,
          bmr: profile.bmr,
          tdeeTarget: profile.dailyCalorieTarget,
          mealsCount: meals.length,
          remainingCaloriesBudget: remainingBudget,
        }),
      });

      if (!response.ok) {
        throw new Error('Impossible de contacter le coach IA');
      }

      const res = await response.json();
      if (res.success && res.data) {
        setCoachData(res.data);
      } else {
        throw new Error(res.error || 'Erreur du coach');
      }
    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || 'Erreur de connexion au coach');
    } finally {
      setIsLoadingCoach(false);
    }
  };

  const handleApplyWorkout = (title: string, calories: number, steps: number = 0) => {
    onAddSimulatedBurn(calories, steps, title);
    setAddedActivity(title);
    setTimeout(() => setAddedActivity(null), 3000);
  };

  return (
    <div className="bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/30 border border-slate-700/60 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Effort Recommandé en Journée
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Prescription sur-mesure pour stabiliser votre poids idéal ({profile.targetWeightKg} kg)
          </p>
        </div>

        <button
          onClick={handleFetchCoach}
          disabled={isLoadingCoach}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
        >
          <Sparkles className={`w-4 h-4 ${isLoadingCoach ? 'animate-spin' : ''}`} />
          <span>{isLoadingCoach ? 'Consultation du Coach...' : 'Avis Coach IA Gemini'}</span>
        </button>
      </div>

      {addedActivity && (
        <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Activité <strong>"{addedActivity}"</strong> comptabilisée avec succès dans votre journée !</span>
        </div>
      )}

      {/* Diagnostic Banner */}
      <div className="my-6 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Objectif d'effort du jour
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {effort.surplusKcal > 0
                ? `Dépenser encore ${effort.targetBurnKcal} kcal pour rester à l'équilibre`
                : `Balance optimale ! Maintenez ~${effort.targetBurnKcal} kcal d'activité saine`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {effort.surplusKcal > 0
                ? `Vos repas dépassent légèrement votre budget cible. Voici les séances idéales calculées selon votre poids de ${profile.currentWeightKg} kg :`
                : `Votre niveau d'activité Google Fit actuel (${fitData.activeCalories} kcal brûlées, ${fitData.steps} pas) correspond parfaitement à votre profil de maintien.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-black text-emerald-400">{effort.targetBurnKcal}</span>
              <span className="text-[10px] text-slate-300 uppercase font-bold">kcal cibles</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-black text-teal-300">{effort.walkMinutes}</span>
              <span className="text-[10px] text-slate-300 uppercase font-bold">min marche</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Exercise Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Marche Active */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Douce / Modérée
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Marche active</h4>
            <p className="text-xs text-slate-400 mb-3">Allure soutenue (~5.5 km/h), idéale en marche digestive.</p>
            <div className="flex items-baseline gap-1.5 text-emerald-400 font-extrabold text-lg">
              <span>{Math.max(15, effort.walkMinutes)} min</span>
              <span className="text-xs text-slate-400 font-medium">
                (~{Math.round(Math.max(15, effort.walkMinutes) * 115)} pas)
              </span>
            </div>
          </div>
          <button
            onClick={() => handleApplyWorkout('Marche active', effort.targetBurnKcal, Math.round(Math.max(15, effort.walkMinutes) * 115))}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Valider cet effort</span>
          </button>
        </div>

        {/* Jogging / Course à pied */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Cardio Intense
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Course / Jogging</h4>
            <p className="text-xs text-slate-400 mb-3">Rythme confortable (~9 km/h), brûle rapidement les glucides.</p>
            <div className="flex items-baseline gap-1.5 text-orange-400 font-extrabold text-lg">
              <span>{Math.max(10, effort.runMinutes)} min</span>
              <span className="text-xs text-slate-400 font-medium">
                (~{Math.round(effort.targetBurnKcal * 1.1)} kcal)
              </span>
            </div>
          </div>
          <button
            onClick={() => handleApplyWorkout('Course à pied', Math.round(effort.targetBurnKcal * 1.1), Math.round(Math.max(10, effort.runMinutes) * 170))}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-orange-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Valider cet effort</span>
          </button>
        </div>

        {/* Vélo / Cyclisme */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Endurance
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Vélo d'extérieur / Appartement</h4>
            <p className="text-xs text-slate-400 mb-3">Impact articulaire doux, cadence fluide et régulière.</p>
            <div className="flex items-baseline gap-1.5 text-blue-400 font-extrabold text-lg">
              <span>{Math.max(15, effort.bikeMinutes)} min</span>
              <span className="text-xs text-slate-400 font-medium">
                (~{Math.round(effort.targetBurnKcal)} kcal)
              </span>
            </div>
          </div>
          <button
            onClick={() => handleApplyWorkout('Vélo', effort.targetBurnKcal, 0)}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-blue-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Valider cet effort</span>
          </button>
        </div>

        {/* HIIT / Renforcement */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Post-combustion
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Circuit Training & Renfo</h4>
            <p className="text-xs text-slate-400 mb-3">Squats, fentes, pompes et gainage pour stimuler le BMR.</p>
            <div className="flex items-baseline gap-1.5 text-purple-400 font-extrabold text-lg">
              <span>{Math.max(12, Math.round(effort.runMinutes * 0.9))} min</span>
              <span className="text-xs text-slate-400 font-medium">haute intensité</span>
            </div>
          </div>
          <button
            onClick={() => handleApplyWorkout('Circuit Training HIIT', effort.targetBurnKcal, 0)}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-purple-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Valider cet effort</span>
          </button>
        </div>
      </div>

      {/* AI Coach Detailed Advice if available */}
      {coachData && (
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-linear-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base sm:text-lg font-bold text-white">
              Analyse du Coach IA : {coachData.headline}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {coachData.summary}
          </p>

          {/* Coach recommended exercise options */}
          {coachData.exerciseOptions && coachData.exerciseOptions.length > 0 && (
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Suggestions personnalisées du Coach :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {coachData.exerciseOptions.map((opt, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{opt.activityName}</div>
                      <div className="text-[11px] text-slate-400">{opt.intensity} • {opt.tips}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-400">{opt.durationMinutes} min</span>
                      <span className="block text-[10px] text-slate-400">-{opt.expectedBurnKcal} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <Droplet className="w-4 h-4 shrink-0 text-blue-400" />
              <span><strong>Hydratation :</strong> {coachData.hydrationAndRecoveryTip}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 italic">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>"{coachData.motivationQuote}"</span>
            </div>
          </div>
        </div>
      )}

      {coachError && (
        <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {coachError}
        </div>
      )}
    </div>
  );
};
