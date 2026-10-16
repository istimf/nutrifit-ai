import React from 'react';
import { Utensils, Trash2, Clock, Plus, Flame } from 'lucide-react';
import type { MealItem } from '../types';

interface MealHistorySectionProps {
  meals: MealItem[];
  onDeleteMeal: (id: string) => void;
  onOpenScanner: () => void;
}

export const MealHistorySection: React.FC<MealHistorySectionProps> = ({
  meals,
  onDeleteMeal,
  onOpenScanner,
}) => {
  const categories: Array<'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation'> = [
    'Petit-déjeuner',
    'Déjeuner',
    'Dîner',
    'Collation',
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Journal des Repas du Jour
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {meals.length === 0 ? 'Aucun repas scanné aujourd\'hui' : `${meals.length} repas analysé${meals.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Ajouter un repas</span>
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
            <Utensils className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-800 text-base mb-1">
            Votre assiette est encore vide aujourd'hui
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Prenez une photo de votre plat ou choisissez un exemple pour estimer instantanément ses calories et voir l'effort à fournir.
          </p>
          <button
            onClick={onOpenScanner}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            Scanner mon premier repas
          </button>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {categories.map((cat) => {
            const catMeals = meals.filter((m) => m.category === cat);
            if (catMeals.length === 0) return null;

            const catCalories = catMeals.reduce((sum, m) => sum + m.totalCalories, 0);

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                  <span className="uppercase tracking-wider">{cat}</span>
                  <span className="text-emerald-700 font-extrabold">{catCalories} kcal</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-white transition shadow-2xs group flex items-start gap-3.5"
                    >
                      {meal.imageBase64 ? (
                        <img
                          src={meal.imageBase64}
                          alt={meal.dishName}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {meal.dishName}
                          </h4>
                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            title="Supprimer ce repas"
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-emerald-700">
                            {meal.totalCalories} kcal
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                            Nutri-Score {meal.nutriScore}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Macros badges */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-2">
                          <span className="text-rose-700">P: {meal.macros.protein}g</span>
                          <span>•</span>
                          <span className="text-amber-700">G: {meal.macros.carbs}g</span>
                          <span>•</span>
                          <span className="text-blue-700">L: {meal.macros.fat}g</span>
                          <span>•</span>
                          <span className="text-emerald-700">F: {meal.macros.fiber}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
