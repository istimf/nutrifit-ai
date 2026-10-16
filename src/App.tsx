import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Camera,
  Activity,
  Flame,
  Scale,
  Sparkles,
  CheckCircle,
  Plus,
  RefreshCw,
  Award,
} from 'lucide-react';
import type { UserProfile, MealItem, GoogleFitActivityData } from './types';
import {
  calculateBMR,
  calculateIdealMaintenanceCalories,
} from './utils/nutritionCalculations';
import { Navbar } from './components/Navbar';
import { EnergyBalanceCard } from './components/EnergyBalanceCard';
import { EffortPrescriptionCard } from './components/EffortPrescriptionCard';
import { GoogleFitSection } from './components/GoogleFitSection';
import { MealHistorySection } from './components/MealHistorySection';
import { MealScannerModal } from './components/MealScannerModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ActivitySimulatorModal } from './components/ActivitySimulatorModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  setCachedAccessToken,
} from './services/auth';
import { fetchGoogleFitDailyActivity } from './services/googleFit';

const DEFAULT_PROFILE: UserProfile = {
  gender: 'male',
  age: 30,
  heightCm: 178,
  currentWeightKg: 74,
  targetWeightKg: 70,
  activityLevel: 'moderate',
  goal: 'maintain',
  bmr: 1720,
  dailyCalorieTarget: 2200,
};

const SEED_MEALS: MealItem[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    dishName: 'Omelette bio aux champignons, toast au levain & avocat',
    category: 'Petit-déjeuner',
    portionDescription: '2 œufs, 1 tranche de pain complet, 1/2 avocat',
    portionMultiplier: 1,
    totalCalories: 430,
    macros: { protein: 22, carbs: 28, fat: 24, fiber: 6 },
    nutriScore: 'A',
    healthScore: 9,
    ingredients: [
      { name: 'Œufs frais bio', estimatedWeightGrams: 110, calories: 155 },
      { name: 'Pain au levain complet', estimatedWeightGrams: 60, calories: 145 },
      { name: 'Avocat frais', estimatedWeightGrams: 60, calories: 100 },
      { name: 'Champignons de Paris', estimatedWeightGrams: 50, calories: 15 },
      { name: 'Filet d\'huile d\'olive', estimatedWeightGrams: 2, calories: 15 },
    ],
    nutritionalAnalysis: 'Excellent apport en choline, protéines biodisponibles et acides gras mono-insaturés pour une satiété prolongée.',
    dietitianTips: ['Parfait pour démarrer la journée sans pic d\'insuline.'],
    effortEquivalents: {
      briskWalkMinutes: 40,
      runningMinutes: 18,
      cyclingMinutes: 25,
    },
    imageBase64: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 1, // 1 hour ago
    dishName: 'Pavé de saumon grillé, riz basmati & brocolis vapeur',
    category: 'Déjeuner',
    portionDescription: 'Assiette complète 450g',
    portionMultiplier: 1,
    totalCalories: 580,
    macros: { protein: 42, carbs: 54, fat: 18, fiber: 7 },
    nutriScore: 'A',
    healthScore: 9,
    ingredients: [
      { name: 'Pavé de saumon', estimatedWeightGrams: 160, calories: 330 },
      { name: 'Riz basmati cuit', estimatedWeightGrams: 180, calories: 200 },
      { name: 'Brocolis vapeur', estimatedWeightGrams: 120, calories: 40 },
      { name: 'Jus de citron & herbes', estimatedWeightGrams: 10, calories: 10 },
    ],
    nutritionalAnalysis: 'Ratio protéines/lipides de haute valeur biologique, riche en oméga-3 EPA/DHA et glucides complexes à faible index glycémique.',
    dietitianTips: ['Idéal pour soutenir la masse musculaire et l\'endurance de l\'après-midi.'],
    effortEquivalents: {
      briskWalkMinutes: 55,
      runningMinutes: 24,
      cyclingMinutes: 35,
    },
    imageBase64: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
  },
];

export default function App() {
  // Profil utilisateur
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutrifit_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const bmr = calculateBMR(DEFAULT_PROFILE.currentWeightKg, DEFAULT_PROFILE.heightCm, DEFAULT_PROFILE.age, DEFAULT_PROFILE.gender);
    const dailyTarget = calculateIdealMaintenanceCalories({ ...DEFAULT_PROFILE, bmr });
    return { ...DEFAULT_PROFILE, bmr, dailyCalorieTarget: dailyTarget };
  });

  // Repas du jour
  const [meals, setMeals] = useState<MealItem[]>(() => {
    const saved = localStorage.getItem('nutrifit_meals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return SEED_MEALS;
  });

  // Google Fit data
  const [fitData, setFitData] = useState<GoogleFitActivityData>(() => {
    const saved = localStorage.getItem('nutrifit_fit');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      steps: 5640,
      activeCalories: 320,
      totalCaloriesBurned: 1680,
      activeMinutes: 38,
      distanceMeters: 4100,
      lastSync: Date.now(),
      isConnected: false,
    };
  });

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSyncingFit, setIsSyncingFit] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('nutrifit_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutrifit_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('nutrifit_fit', JSON.stringify(fitData));
  }, [fitData]);

  // Auth & Google Fit Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        if (token) {
          setFitData((prev) => ({
            ...prev,
            isConnected: true,
            userEmail: user.email || undefined,
            userName: user.displayName || undefined,
          }));
          syncGoogleFitData(token);
        }
      },
      () => {
        setFitData((prev) => ({ ...prev, isConnected: false }));
      }
    );
    return () => unsubscribe();
  }, []);

  const syncGoogleFitData = async (tokenOverride?: string) => {
    const token = tokenOverride || getAccessToken();
    if (!token) return;

    setIsSyncingFit(true);
    try {
      const realFit = await fetchGoogleFitDailyActivity(token);
      setFitData((prev) => ({
        ...prev,
        ...realFit,
        isConnected: true,
      }));
    } catch (err) {
      console.warn('Google Fit fetch error, keeping existing metrics:', err);
    } finally {
      setIsSyncingFit(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result && result.accessToken) {
        setCachedAccessToken(result.accessToken);
        setFitData((prev) => ({
          ...prev,
          isConnected: true,
          userEmail: result.user.email || undefined,
          userName: result.user.displayName || undefined,
        }));
        await syncGoogleFitData(result.accessToken);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setFitData((prev) => ({ ...prev, isConnected: false }));
  };

  const handleAddMeal = (newMeal: MealItem) => {
    setMeals((prev) => [newMeal, ...prev]);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleAddSimulatedBurn = (calories: number, steps: number) => {
    setFitData((prev) => ({
      ...prev,
      activeCalories: prev.activeCalories + calories,
      steps: prev.steps + steps,
      distanceMeters: prev.distanceMeters + Math.round(steps * 0.75),
      activeMinutes: prev.activeMinutes + Math.round(calories / 8),
      lastSync: Date.now(),
    }));
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-24">
      {/* Navigation Header */}
      <Navbar
        profile={profile}
        fitData={fitData}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        isSyncingFit={isSyncingFit}
        onSyncFit={() => syncGoogleFitData()}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Hero Banner Greeting & Daily Goal */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Coach Nutritionnel & Activité Physique</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Reconnaissance de vos repas & Maintien du poids idéal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Photographiez vos plats cuisinés : l'IA évalue les calories et micronutriments, croise vos données de marche et dépenses <strong>Google Fit</strong>, et vous prescrit l'effort physique exact à réaliser en journée pour stabiliser vos <strong>{profile.targetWeightKg} kg</strong>.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Scanner un repas préparé</span>
              </button>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Cible : {profile.targetWeightKg} kg</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Energy Balance Dashboard */}
        <EnergyBalanceCard
          profile={profile}
          meals={meals}
          fitData={fitData}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* 2. Physical Effort Prescription Engine ("Quel effort dois-je faire en journée ?") */}
        <EffortPrescriptionCard
          profile={profile}
          meals={meals}
          fitData={fitData}
          onAddSimulatedBurn={handleAddSimulatedBurn}
        />

        {/* 3. Google Fit Real-Time Activity Tracking */}
        <GoogleFitSection
          fitData={fitData}
          isSyncing={isSyncingFit}
          onSync={() => syncGoogleFitData()}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onGoogleSignIn={handleGoogleSignIn}
        />

        {/* 4. Meals of the Day Log & Visual Details */}
        <MealHistorySection
          meals={meals}
          onDeleteMeal={handleDeleteMeal}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      </main>

      {/* Modals */}
      <MealScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddMeal={handleAddMeal}
      />

      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <ActivitySimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAddBurn={handleAddSimulatedBurn}
      />

      <MobileInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
