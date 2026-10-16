# 🥗 NutriFit AI — Scanner de Repas & Coach Poids Idéal avec Google Fit

Application intelligente de reconnaissance visuelle de repas par IA, d'estimation calorique instantanée, et de prescription d'effort physique personnalisée synchronisée avec vos activités **Google Fit** pour maintenir votre poids idéal.

---

## ✨ Fonctionnalités Principales

- **📸 Scanner de Repas Multimodal (Gemini 3.8 Flash)** :
  - Détection automatique des aliments cuisinés depuis votre caméra ou importation photo.
  - Identification précise des ingrédients et de leurs portions estimées (grammes).
  - Calcul du total calorique (kcal) et des macronutriments (protéines, glucides, lipides, fibres).
  - Score santé /10 et label Nutri-Score (A à E).
  - Analyse diététique et conseils sur-mesure d'un nutritionniste.
  - Multiplicateur de portion ajustable (0.75x, 1x, 1.25x, 1.5x).

- **🏃 Intégration Google Fit REST API** :
  - Authentification officielle Google OAuth avec scopes fitness (`fitness.activity.read`, `fitness.body.read`).
  - Synchronisation en direct du nombre de pas quotidiens, des calories actives brûlées, des minutes d'effort et de la distance parcourue.
  - Simulateur et ajout manuel d'activité pour tester instantanément l'impact de vos séances (marche digestive, running, vélo, etc.).

- **⚖️ Maintien du Poids Idéal & Prescription d'Effort** :
  - Calcul clinique du Métabolisme de Base (BMR selon Mifflin-St Jeor) et du budget calorique de maintien (TDEE).
  - Diagnostic en temps réel de la balance énergétique (déficit, équilibre, surplus).
  - **« Quel effort faire en journée ? »** : conversion mathématique automatique des calories en temps d'effort précis (marche active, course à pied, vélo, renforcement HIIT).
  - Consultation d'un **Coach IA Gemini** pour une stratégie d'effort et de récupération adaptée.

- **📱 Application Mobile PWA (Progressive Web App)** :
  - Installable nativement sur smartphones iOS (iPhone via Safari) et Android (via Google Chrome).
  - Fonctionne hors-ligne avec Service Worker et mise en cache des assets.

---

## 🚀 Installation & Lancement Local

### Prérequis
- Node.js 18+ ou 20+
- Clé d'API Gemini (`GEMINI_API_KEY`)

### Démarrage
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur full-stack de développement (port 3000)
npm run dev
```

---

## 📦 Déploiement sur votre GitHub

Pour lier et publier ce projet sur votre propre compte GitHub :

```bash
# 1. Créez un nouveau dépôt sur https://github.com/new (ex: nutrifit-ai)

# 2. Liez le dépôt distant à votre projet
git remote add origin https://github.com/VOTRE_PSEUDO/nutrifit-ai.git

# 3. Poussez le code sur la branche principale
git branch -M main
git push -u origin main
```

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **PWA** : vite-plugin-pwa, Service Worker Workbox, Web App Manifest
- **Backend** : Express.js, `@google/genai` (SDK officiel Gemini)
- **Authentification & Cloud** : Firebase Auth (Google Sign-In), Google Fit REST API
