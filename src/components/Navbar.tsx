import React from 'react';
import { Utensils, Flame, Activity, User as UserIcon, RefreshCw, LogIn, LogOut, CheckCircle2, Smartphone } from 'lucide-react';
import type { UserProfile, GoogleFitActivityData } from '../types';

interface NavbarProps {
  profile: UserProfile;
  fitData: GoogleFitActivityData;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onOpenSimulator: () => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  isSyncingFit: boolean;
  onSyncFit: () => void;
  onOpenInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  fitData,
  onOpenScanner,
  onOpenProfile,
  onOpenSimulator,
  onGoogleSignIn,
  onGoogleSignOut,
  isSyncingFit,
  onSyncFit,
  onOpenInstall,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-tr from-emerald-600 via-teal-500 to-lime-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Nutri<span className="text-emerald-600">Fit</span>
                  <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    AI
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Scanner Repas & Coaching d'effort Google Fit
              </p>
            </div>
          </div>

          {/* Center stats pills */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">Poids cible :</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {profile.targetWeightKg} kg
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Budget :</span>
              <span className="font-bold text-slate-900">{profile.dailyCalorieTarget} kcal</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Pas :</span>
              <span className="font-bold text-teal-700">{fitData.steps.toLocaleString()}</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Fit Connection button */}
            {fitData.isConnected ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-emerald-900 leading-none">Google Fit</span>
                  <span className="text-[10px] text-emerald-600 leading-tight">Connecté</span>
                </div>
                <button
                  onClick={onSyncFit}
                  disabled={isSyncingFit}
                  title="Synchroniser Google Fit"
                  className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFit ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onGoogleSignOut}
                  title="Déconnecter Google Fit"
                  className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span className="hidden sm:inline">Lier Google Fit</span>
                <span className="sm:hidden">Fit</span>
              </button>
            )}

            {/* Profile Settings */}
            <button
              onClick={onOpenProfile}
              title="Modifier profil & objectif de poids"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Profil ({profile.currentWeightKg}kg)</span>
            </button>

            {/* Mobile / GitHub Install Button */}
            <button
              onClick={onOpenInstall}
              title="Installer sur téléphone ou déployer sur GitHub"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Téléphone / Git</span>
            </button>

            {/* Scanner CTA */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Scanner un repas</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
