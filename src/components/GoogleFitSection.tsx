import React from 'react';
import { Activity, Footprints, Flame, Clock, MapPin, RefreshCw, PlusCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { GoogleFitActivityData } from '../types';

interface GoogleFitSectionProps {
  fitData: GoogleFitActivityData;
  isSyncing: boolean;
  onSync: () => void;
  onOpenSimulator: () => void;
  onGoogleSignIn: () => void;
}

export const GoogleFitSection: React.FC<GoogleFitSectionProps> = ({
  fitData,
  isSyncing,
  onSync,
  onOpenSimulator,
  onGoogleSignIn,
}) => {
  const stepsGoal = 10000;
  const stepsPercentage = Math.min(100, Math.round((fitData.steps / stepsGoal) * 100));
  const distanceKm = (fitData.distanceMeters / 1000).toFixed(2);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Activité Google Fit du Jour
              </h3>
              {fitData.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Connecté
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Mode manuel / local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dépense énergétique réelle traquée pour ajuster précisément votre maintien de poids
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {fitData.isConnected ? (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Actualiser Fit'}</span>
            </button>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Connecter Google Fit</span>
            </button>
          )}

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Ajouter une activité</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Pas */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-600" />
              Pas effectués
            </span>
            <span className="text-[11px] font-bold text-slate-400">{stepsPercentage}%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {fitData.steps.toLocaleString()}
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stepsPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Objectif : {stepsGoal.toLocaleString()} pas</span>
        </div>

        {/* Calories Actives */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Calories brûlées
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">Actives</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {fitData.activeCalories} <span className="text-xs font-semibold text-slate-500">kcal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Comptabilisées dans la balance
          </p>
        </div>

        {/* Minutes Actives */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Temps actif
            </span>
            <span className="text-[11px] text-slate-400">Cardio</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {fitData.activeMinutes} <span className="text-xs font-semibold text-slate-500">min</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Min. intensité modérée à vive
          </p>
        </div>

        {/* Distance */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-purple-600" />
              Distance
            </span>
            <span className="text-[11px] text-slate-400">GPS / Capteurs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {distanceKm} <span className="text-xs font-semibold text-slate-500">km</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Parcours cumulé aujourd'hui
          </p>
        </div>
      </div>

      {/* Info notice about Google Fit synchronisation */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Intégration Google Fit vérifiée :</strong> Vos données de marche, de course et de séances sportives sont lues directement depuis Google Fit avec votre permission. Toute dépense physique enregistrée augmente dynamiquement votre marge calorique afin de stabiliser votre poids idéal sans privation excessive.
        </div>
      </div>
    </div>
  );
};
