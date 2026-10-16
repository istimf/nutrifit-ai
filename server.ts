import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '35mb' }));

// Initialiser le client GoogleGenAI côté serveur avec headers requis
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint d'analyse d'image et de repas
app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mealDescription, mealType = 'lunch' } = req.body;

    if (!imageBase64 && !mealDescription) {
      return res.status(400).json({ error: 'Une image ou une description du repas est requise.' });
    }

    const promptText = `Tu es un nutritionniste et diététicien expert en reconnaissance visuelle d'aliments et calcul calorique de précision.
Analyse ce repas ${mealDescription ? `(indices fournis par l'utilisateur: "${mealDescription}")` : ''} pour le moment : ${mealType}.

Identifie précisément :
1. Le nom complet et appétissant du plat en français.
2. La liste détaillée des ingrédients et éléments détectés avec leur poids estimé en grammes et leurs calories.
3. Le total des calories (kcal) avec une estimation réaliste de la portion.
4. Les macronutriments complets : protéines (g), glucides (g), lipides (g), fibres alimentaires (g), sel/sodium (g estimé).
5. Un Nutri-Score estimé (A, B, C, D ou E).
6. Un score santé global sur 10.
7. Une analyse nutritionnelle détaillée en 2-3 phrases (points forts, équilibre, oméga/vitamines, impact glycémique).
8. Des conseils pour optimiser ce plat pour maintenir son poids idéal (ex: réduction de sauces, ajout de fibres, timing).
9. Des équivalents d'efforts physiques types pour compenser ou brûler ce repas (ex: minutes de marche rapide, minutes de course, minutes de vélo).`;

    const parts: any[] = [];
    if (imageBase64) {
      // Nettoyer le préfixe data URL si présent
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }

    parts.push({
      text: promptText,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: "Tu es un chef nutritionniste bilingue français hautement qualifié. Réponds toujours avec exactitude en JSON valide strictement structuré selon le schéma fourni. Tout le texte descriptif doit être en français naturel.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: 'Nom appétissant et précis du plat' },
            category: { type: Type.STRING, description: 'Catégorie du repas (Petit-déjeuner, Déjeuner, Dîner, Collation)' },
            portionDescription: { type: Type.STRING, description: 'Description de la portion (ex: 1 assiette complète 420g)' },
            totalCalories: { type: Type.NUMBER, description: 'Total des calories en kcal' },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER, description: 'Protéines en grammes' },
                carbs: { type: Type.NUMBER, description: 'Glucides en grammes' },
                fat: { type: Type.NUMBER, description: 'Lipides en grammes' },
                fiber: { type: Type.NUMBER, description: 'Fibres alimentaires en grammes' },
                sugar: { type: Type.NUMBER, description: 'Sucres en grammes' },
              },
              required: ['protein', 'carbs', 'fat', 'fiber'],
            },
            nutriScore: { type: Type.STRING, description: 'Note Nutri-Score (A, B, C, D ou E)' },
            healthScore: { type: Type.NUMBER, description: 'Note santé de 1 à 10' },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nom de l'ingrédient" },
                  estimatedWeightGrams: { type: Type.NUMBER, description: 'Poids estimé en grammes' },
                  calories: { type: Type.NUMBER, description: 'Calories apportées' },
                  portionLabel: { type: Type.STRING, description: 'ex: 1 filet moyen, 1 tasse, 2 cuillères' },
                },
                required: ['name', 'estimatedWeightGrams', 'calories'],
              },
            },
            nutritionalAnalysis: { type: Type.STRING, description: 'Analyse diététique et équilibre des macronutriments' },
            dietitianTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Conseils pratiques pour optimiser ce repas'
            },
            effortEquivalents: {
              type: Type.OBJECT,
              properties: {
                briskWalkMinutes: { type: Type.NUMBER, description: 'Minutes de marche active (5.5 km/h)' },
                runningMinutes: { type: Type.NUMBER, description: 'Minutes de course à pied (9 km/h)' },
                cyclingMinutes: { type: Type.NUMBER, description: 'Minutes de vélo allure modérée' },
                swimmingMinutes: { type: Type.NUMBER, description: 'Minutes de natation' },
                hiitMinutes: { type: Type.NUMBER, description: 'Minutes de cardio intense / HIIT' },
              },
              required: ['briskWalkMinutes', 'runningMinutes', 'cyclingMinutes'],
            },
          },
          required: ['dishName', 'totalCalories', 'macros', 'nutriScore', 'healthScore', 'ingredients', 'nutritionalAnalysis', 'dietitianTips', 'effortEquivalents'],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    return res.status(500).json({ error: error.message || "Erreur lors de l'analyse du repas" });
  }
});

// Endpoint de coaching d'effort physique personnalisé basé sur Google Fit et le poids idéal
app.post('/api/coach-recommendation', async (req, res) => {
  try {
    const {
      currentCaloriesConsumed,
      caloriesBurnedTotal,
      activeCaloriesBurned,
      stepCount,
      currentWeight,
      targetWeight,
      bmr,
      tdeeTarget,
      mealsCount,
      remainingCaloriesBudget,
    } = req.body;

    const prompt = `Tu es un coach sportif et nutritionniste expert en gestion et stabilisation du poids idéal.
Données de l'utilisateur aujourd'hui :
- Poids actuel : ${currentWeight} kg
- Poids idéal visé : ${targetWeight} kg
- Métabolisme de base (BMR) : ${bmr} kcal
- Budget énergétique cible de maintien (TDEE) : ${tdeeTarget} kcal
- Calories consommées aujourd'hui (${mealsCount} repas enregistrés) : ${currentCaloriesConsumed} kcal
- Activité physique Google Fit enregistrée aujourd'hui :
  * Calories actives brûlées : ${activeCaloriesBurned} kcal
  * Pas effectués : ${stepCount} pas
  * Total calories dépensées estimées : ${caloriesBurnedTotal} kcal
- Solde calorique restant pour maintien idéal : ${remainingCaloriesBudget} kcal

Rédige un plan d'action d'effort pour la journée afin de maintenir exactement le poids idéal :
1. Un diagnostic ultra clair de la balance énergétique du jour (Déficit, Équilibre parfait ou Léger surplus).
2. La recommandation d'effort précise (ex: ajouter 3500 pas, faire 25 min de vélo d'appartement ou une marche digestive de 30 min, ou bien repos mérité si l'objectif est déjà atteint).
3. Trois options d'exercices adaptées avec durée précise en minutes et calories brûlées.
4. Un conseil d'hydratation et de timing (avant ou après le prochain repas).
5. Un message d'encouragement dynamique et bienveillant en français.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "Statut: 'on_track' | 'needs_effort' | 'surplus_alert' | 'deficit_recovery'" },
            headline: { type: Type.STRING, description: "Titre percutant du diagnostic (ex: 'Objectif presque atteint !')" },
            summary: { type: Type.STRING, description: "Explication claire de la situation énergétique" },
            recommendedEffortKcal: { type: Type.NUMBER, description: "Nombre de calories supplémentaires à dépenser aujourd'hui" },
            recommendedStepsToAdd: { type: Type.NUMBER, description: "Nombre de pas recommandés à rajouter aujourd'hui" },
            exerciseOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  activityName: { type: Type.STRING, description: "Nom de l'activité (ex: Marche active après dîner)" },
                  durationMinutes: { type: Type.NUMBER, description: "Durée en minutes" },
                  intensity: { type: Type.STRING, description: "Douce, Modérée, ou Intense" },
                  expectedBurnKcal: { type: Type.NUMBER, description: "Calories dépensées" },
                  iconType: { type: Type.STRING, description: "walk, run, bike, swim, workout" },
                  tips: { type: Type.STRING, description: "Astuce d'exécution" }
                },
                required: ['activityName', 'durationMinutes', 'intensity', 'expectedBurnKcal', 'iconType']
              }
            },
            hydrationAndRecoveryTip: { type: Type.STRING, description: "Conseil d'hydratation ou de récupération" },
            motivationQuote: { type: Type.STRING, description: "Phrase de motivation stimulante" }
          },
          required: ['status', 'headline', 'summary', 'recommendedEffortKcal', 'exerciseOptions', 'hydrationAndRecoveryTip', 'motivationQuote']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Coach recommendation error:', error);
    return res.status(500).json({ error: error.message || "Erreur de génération du conseil" });
  }
});

// Configuration Vite middlewares en développement
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NutriFit AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
