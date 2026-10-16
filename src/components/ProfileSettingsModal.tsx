import React, { useState } from 'react';
import { X, User, Scale, Activity, Check, Target, HeartPulse } from 'lucide-react';
import type { UserProfile, Gender, ActivityLevel } from '../types';
import {
  calculateBMR,
  calculateTDEE,
  calculateIdealMaintenanceCalories,
  ACTIVITY_LABELS,
} from '../utils/nutritionCalculations';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [age, setAge] = useState<number>(profile.age);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(profile.currentWeightKg);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(profile.targetWeightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<'maintain' | 'gentle_loss' | 'gentle_gain'>(profile.goal);

  // Live calculations
  const currentBMR = calculateBMR(currentWeightKg, heightCm, age, gender);
  const currentBMI = (currentWeightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  const targetBMI = (targetWeightKg / Math.pow(heightCm / 100, 2)).toFixed(1);

  const previewProfile: UserProfile = {
    gender,
    age,
    heightCm,
    currentWeightKg,
    targetWeightKg,
    activityLevel,
    goal,
    bmr: currentBMR,
    dailyCalorieTarget: 0,
  };
  const calculatedTargetCalories = calculateIdealMaintenanceCalories(previewProfile);

  const handleSave = () => {
    const updated: UserProfile = {
      ...previewProfile,
      dailyCalorieTarget: calculatedTargetCalories,
    };
    onSaveProfile(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Profil & Objectif Poids Idéal
              </h3>
              <p className="text-xs text-slate-500">
                Paramètres physiologiques et métabolisme de maintien
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sexe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Sexe biologique (pour calcul BMR précis)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'female', label: 'Femme' },
                { id: 'male', label: 'Homme' },
                { id: 'other', label: 'Autre' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as Gender)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    gender === g.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Âge & Taille */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Âge (années)
              </label>
              <input
                type="number"
                min={14}
                max={100}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Taille (cm)
              </label>
              <input
                type="number"
                min={120}
                max={225}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 170)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Poids Actuel vs Poids Cible Idéal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Poids actuel (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min={35}
                max={220}
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full px-3 py-1.5 text-lg font-black bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                IMC actuel : <strong>{currentBMI}</strong>
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Poids idéal visé (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min={35}
                max={220}
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 68)}
                className="w-full px-3 py-1.5 text-lg font-black bg-white border border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-500 text-emerald-950"
              />
              <span className="text-[11px] text-emerald-700 mt-1 block">
                IMC cible : <strong>{targetBMI}</strong> (idéal 18.5 - 24.9)
              </span>
            </div>
          </div>

          {/* Niveau d'activité */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Niveau d'activité physique habituel
            </label>
            <div className="space-y-1.5">
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((lvl) => (
                <div
                  key={lvl}
                  onClick={() => setActivityLevel(lvl)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activityLevel === lvl
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{ACTIVITY_LABELS[lvl].title}</span>
                    <span className="text-[11px] text-slate-500">{ACTIVITY_LABELS[lvl].desc}</span>
                  </div>
                  {activityLevel === lvl && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Goal selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Objectif spécifique
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'maintain', label: 'Maintenir poids idéal', desc: 'Maintien strict' },
                { id: 'gentle_loss', label: 'Atteindre poids idéal', desc: '-350 kcal/j' },
                { id: 'gentle_gain', label: 'Prise de masse', desc: '+300 kcal/j' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as any)}
                  className={`p-2 text-left rounded-xl border transition ${
                    goal === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className={`text-[10px] block ${goal === item.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
                  Budget calorique journalier calculé
                </span>
                <span className="text-xs text-slate-600">
                  Métabolisme de base (BMR) : {currentBMR} kcal
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-900">{calculatedTargetCalories}</span>
                <span className="text-xs font-bold text-emerald-700 ml-1">kcal/jour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer mon profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
