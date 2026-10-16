import React, { useState } from 'react';
import { X, Activity, Flame, Footprints, Plus, Bike, HeartPulse, Clock } from 'lucide-react';

interface ActivitySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBurn: (calories: number, steps: number, title: string) => void;
}

export const ActivitySimulatorModal: React.FC<ActivitySimulatorModalProps> = ({
  isOpen,
  onClose,
  onAddBurn,
}) => {
  const [stepsToAdd, setStepsToAdd] = useState<number>(2500);
  const [caloriesToAdd, setCaloriesToAdd] = useState<number>(180);
  const [activeMinutesToAdd, setActiveMinutesToAdd] = useState<number>(25);
  const [activityName, setActivityName] = useState<string>('Marche active digestive');

  const presets = [
    { title: 'Marche digestive 30 min', steps: 3200, kcal: 150, min: 30, icon: Footprints },
    { title: 'Footing / Jogging 5 km', steps: 5800, kcal: 420, min: 32, icon: Flame },
    { title: 'Séance de Vélo 45 min', steps: 500, kcal: 320, min: 45, icon: Bike },
    { title: 'Entraînement Fitness / HIIT', steps: 1800, kcal: 260, min: 25, icon: HeartPulse },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    onAddBurn(p.kcal, p.steps, p.title);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBurn(caloriesToAdd, stepsToAdd, activityName || 'Activité manuelle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Ajouter une Activité Physique
              </h3>
              <p className="text-xs text-slate-500">
                Incrémente la dépense Google Fit et recalcule la balance énergétique
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Ajout rapide en 1 clic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset, idx) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-100/70 group-hover:bg-teal-600 group-hover:text-white text-teal-700 flex items-center justify-center shrink-0 transition">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{preset.title}</span>
                      <span className="text-[11px] font-semibold text-teal-700">
                        +{preset.kcal} kcal • {preset.steps > 0 ? `${preset.steps.toLocaleString()} pas` : `${preset.min} min`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-xs font-bold text-slate-400 uppercase">Ou saisie sur-mesure</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Custom form */}
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nom de l'effort physique
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Ex: Natation, Montée d'escaliers, Yoga dynamique..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  min={10}
                  max={2500}
                  value={caloriesToAdd}
                  onChange={(e) => setCaloriesToAdd(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-base font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-teal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Pas additionnels
                </label>
                <input
                  type="number"
                  min={0}
                  max={40000}
                  value={stepsToAdd}
                  onChange={(e) => setStepsToAdd(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-base font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Durée (min)
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={activeMinutesToAdd}
                  onChange={(e) => setActiveMinutesToAdd(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-base font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer cette séance dans la journée</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
