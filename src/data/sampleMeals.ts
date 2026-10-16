export interface PresetMealSample {
  id: string;
  name: string;
  category: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  imageUrl: string;
  description: string;
  previewCalories: number;
}

export const SAMPLE_MEALS: PresetMealSample[] = [
  {
    id: 'sample-1',
    name: 'Pavé de saumon rôti, riz basmati & brocolis',
    category: 'Déjeuner',
    description: '150g de saumon atlantique poêlé à l\'huile d\'olive, 180g de riz basmati vapeur et fleurettes de brocolis frais.',
    previewCalories: 580,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-2',
    name: 'Poké bowl avocat, quinoa, edamame & tofu grillé',
    category: 'Déjeuner',
    description: 'Bowl équilibré avec quinoa, dés de tofu mariné au sésame, avocat frais, edamame, carottes râpées et vinaigrette gingembre-soja.',
    previewCalories: 520,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-3',
    name: 'Filet de poulet grillé, purée de patates douces & haricots',
    category: 'Dîner',
    description: 'Blanc de poulet mariné aux herbes de Provence, écrasé de patate douce au filet d\'huile d\'olive et haricots verts croquants.',
    previewCalories: 490,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-4',
    name: 'Omelette champignon-épinards, toast levain & fruits frais',
    category: 'Petit-déjeuner',
    description: 'Omelette de 2 œufs bio aux épinards et champignons de Paris, tranche de pain au levain grillée et quartiers d\'orange.',
    previewCalories: 395,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-5',
    name: 'Pâtes complètes au coulis de tomates fraîches & basilic',
    category: 'Dîner',
    description: 'Penne complètes al dente, sauce mijotée aux tomates mûres, ail, huile d\'olive vierge et copeaux de parmesan.',
    previewCalories: 460,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  },
];
