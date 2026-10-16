import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Flame,
  Check,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Footprints,
  Bike,
  RefreshCcw,
  Sliders,
} from 'lucide-react';
import type { MealItem } from '../types';
import { SAMPLE_MEALS, type PresetMealSample } from '../data/sampleMeals';

interface MealScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: MealItem) => void;
}

export const MealScannerModal: React.FC<MealScannerModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [selectedCategory, setSelectedCategory] = useState<'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation'>('Déjeuner');
  const [mealDescription, setMealDescription] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedMeal, setAnalyzedMeal] = useState<MealItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Clean camera stream on modal close or tab change
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions ou importez une photo.');
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = async (sample: PresetMealSample) => {
    setSelectedCategory(sample.category);
    setMealDescription(sample.description);
    setPreviewImage(sample.imageUrl);
  };

  const handleAnalyze = async () => {
    if (!previewImage && !mealDescription) {
      setAnalysisError('Veuillez fournir une photo ou une description du repas.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalyzedMeal(null);

    try {
      // Si l'image est une URL distante Unsplash, convertir en base64 pour Gemini
      let imageBase64ToSend = previewImage;
      let mimeType = 'image/jpeg';

      if (previewImage && previewImage.startsWith('http')) {
        try {
          const resp = await fetch(previewImage);
          const blob = await resp.blob();
          mimeType = blob.type || 'image/jpeg';
          const reader = new FileReader();
          imageBase64ToSend = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Impossible de convertir l\'URL externe en base64, passage de la description', e);
          imageBase64ToSend = null;
        }
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64ToSend,
          mimeType: mimeType,
          mealDescription: mealDescription,
          mealType: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du repas par Gemini');
      }

      const res = await response.json();
      if (res.success && res.data) {
        const item: MealItem = {
          id: `meal-${Date.now()}`,
          timestamp: Date.now(),
          dishName: res.data.dishName,
          category: selectedCategory,
          portionDescription: res.data.portionDescription,
          portionMultiplier: 1,
          totalCalories: res.data.totalCalories,
          macros: res.data.macros,
          nutriScore: res.data.nutriScore || 'B',
          healthScore: res.data.healthScore || 8,
          ingredients: res.data.ingredients || [],
          nutritionalAnalysis: res.data.nutritionalAnalysis || '',
          dietitianTips: res.data.dietitianTips || [],
          effortEquivalents: res.data.effortEquivalents || {
            briskWalkMinutes: 45,
            runningMinutes: 20,
            cyclingMinutes: 30,
          },
          imageBase64: previewImage || undefined,
        };
        setAnalyzedMeal(item);
        setPortionMultiplier(1);
      } else {
        throw new Error(res.error || 'Erreur inattendue');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Impossible d\'analyser ce repas. Réessayez.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!analyzedMeal) return;
    const finalMeal: MealItem = {
      ...analyzedMeal,
      portionMultiplier: portionMultiplier,
      totalCalories: Math.round(analyzedMeal.totalCalories * portionMultiplier),
      macros: {
        protein: Math.round(analyzedMeal.macros.protein * portionMultiplier),
        carbs: Math.round(analyzedMeal.macros.carbs * portionMultiplier),
        fat: Math.round(analyzedMeal.macros.fat * portionMultiplier),
        fiber: Math.round(analyzedMeal.macros.fiber * portionMultiplier),
        sugar: analyzedMeal.macros.sugar ? Math.round(analyzedMeal.macros.sugar * portionMultiplier) : undefined,
      },
    };
    onAddMeal(finalMeal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Scanner & Reconnaissance de Repas
              </h3>
              <p className="text-xs text-slate-500">
                IA Multimodale Gemini • Estimation des calories & macros
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!analyzedMeal ? (
            <>
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Moment du repas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs: Exemples 1-clic | Importer photo | Caméra en direct */}
              <div className="flex border-b border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setActiveTab('samples'); stopCamera(); }}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    activeTab === 'samples'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Plats exemples (1 clic)
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('upload'); stopCamera(); }}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    activeTab === 'upload'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Importer une photo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    activeTab === 'camera'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Caméra en direct
                </button>
              </div>

              {/* Tab: Samples */}
              {activeTab === 'samples' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Cliquez sur un repas préparé pour tester la reconnaissance IA instantanément :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {SAMPLE_MEALS.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                          previewImage === sample.imageUrl
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <img
                          src={sample.imageUrl}
                          alt={sample.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{sample.name}</h4>
                          <span className="text-[11px] font-semibold text-emerald-600 block">
                            ~{sample.previewCalories} kcal • {sample.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Upload Photo */}
              {activeTab === 'upload' && (
                <div>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl bg-slate-50/60 cursor-pointer transition group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mb-2 transition" />
                    <span className="text-xs font-bold text-slate-700">Glissez une photo de votre repas</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG ou WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab: Live Camera */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {cameraError ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      {cameraError}
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-64 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {isCameraActive && (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-white text-slate-900 text-xs font-extrabold shadow-xl hover:bg-emerald-50 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>Prendre la photo</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Image Preview with Laser Scanning Animation if analyzing */}
              {previewImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-52 bg-slate-950 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Aperçu repas"
                    className="w-full h-52 object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                      {/* Laser beam scan */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce" />
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                      <span className="text-xs font-black tracking-wide uppercase">
                        Gemini analyse les aliments...
                      </span>
                      <span className="text-[11px] text-emerald-200 mt-1">
                        Détection des portions et calcul calorique
                      </span>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Notes / Optional description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Détails ou préparation maison (facultatif)
                </label>
                <input
                  type="text"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Ex: Cuisiné avec 1 c. à soupe d'huile d'olive, sans sel ajouté..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              {analysisError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {analysisError}
                </div>
              )}
            </>
          ) : (
            /* Results View after Gemini analysis */
            <div className="space-y-5 animate-fade-in">
              {/* Dish Header */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                      {analyzedMeal.category}
                    </span>
                    <span className="text-xs text-emerald-900 font-semibold">
                      Nutri-Score : <strong className="text-sm font-black text-emerald-700">{analyzedMeal.nutriScore}</strong>
                    </span>
                    <span className="text-xs text-slate-500">• Note {analyzedMeal.healthScore}/10</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{analyzedMeal.dishName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{analyzedMeal.portionDescription}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-emerald-900">
                    {Math.round(analyzedMeal.totalCalories * portionMultiplier)}
                  </div>
                  <span className="text-xs font-bold text-emerald-700">kcal estimées</span>
                </div>
              </div>

              {/* Portion adjustment slider / buttons */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    Ajuster la portion consommée
                  </span>
                  <span className="font-extrabold text-emerald-700">{portionMultiplier}x portion</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.75, 1, 1.25, 1.5].map((multiplier) => (
                    <button
                      key={multiplier}
                      type="button"
                      onClick={() => setPortionMultiplier(multiplier)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        portionMultiplier === multiplier
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {multiplier}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Protéines</span>
                  <span className="text-base font-black text-rose-950">
                    {Math.round(analyzedMeal.macros.protein * portionMultiplier)}g
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Glucides</span>
                  <span className="text-base font-black text-amber-950">
                    {Math.round(analyzedMeal.macros.carbs * portionMultiplier)}g
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Lipides</span>
                  <span className="text-base font-black text-blue-950">
                    {Math.round(analyzedMeal.macros.fat * portionMultiplier)}g
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Fibres</span>
                  <span className="text-base font-black text-emerald-950">
                    {Math.round(analyzedMeal.macros.fiber * portionMultiplier)}g
                  </span>
                </div>
              </div>

              {/* Detected Ingredients */}
              {analyzedMeal.ingredients && analyzedMeal.ingredients.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                    Ingrédients identifiés par l'IA :
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {analyzedMeal.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                        <span className="font-semibold text-slate-800">{ing.name}</span>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>{Math.round(ing.estimatedWeightGrams * portionMultiplier)}g</span>
                          <span className="font-bold text-emerald-700">
                            {Math.round(ing.calories * portionMultiplier)} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutritionist Analysis */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Analyse du diététicien :</span>
                {analyzedMeal.nutritionalAnalysis}
              </div>

              {/* Effort Equivalents for this meal */}
              <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wide block mb-2">
                  Effort pour dépenser l'énergie de ce plat :
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-teal-100">
                    <Footprints className="w-4 h-4 mx-auto text-teal-600 mb-1" />
                    <span className="font-extrabold text-slate-900 block">
                      {Math.round(analyzedMeal.effortEquivalents.briskWalkMinutes * portionMultiplier)} min
                    </span>
                    <span className="text-[10px] text-slate-500">Marche active</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-teal-100">
                    <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                    <span className="font-extrabold text-slate-900 block">
                      {Math.round(analyzedMeal.effortEquivalents.runningMinutes * portionMultiplier)} min
                    </span>
                    <span className="text-[10px] text-slate-500">Course</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-teal-100">
                    <Bike className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <span className="font-extrabold text-slate-900 block">
                      {Math.round(analyzedMeal.effortEquivalents.cyclingMinutes * portionMultiplier)} min
                    </span>
                    <span className="text-[10px] text-slate-500">Vélo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {!analyzedMeal ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!previewImage && !mealDescription)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyse en cours...' : 'Reconnaître & Calculer'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAnalyzedMeal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Re-scanner</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Ajouter à mon journal</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
