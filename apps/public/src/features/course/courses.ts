export type YogaCategory = 'adulte' | 'enfant' | 'parent-enfant' | 'particulier';

export interface YogaCourse {
  id: string;
  title: string;
  subtitle: string;
  category: YogaCategory;
  groupSize: string;
  duration: string;
  locationName: string;
  description: string;
  benefits: string[];
  image: string;
  trialPrice: string;
}

export const COURSES: YogaCourse[] = [
  {
    id: 'hatha-adulte',
    title: 'Hatha Yoga & Yoga Sans Dégâts',
    subtitle: 'Approche physiologique certifiée De Gasquet',
    category: 'adulte',
    groupSize: '4 à 6 élèves max',
    duration: '1h15',
    locationName: 'Mini-Studio (8 rue des Moissonneurs)',
    description:
      "Une pratique de Hatha Yoga authentique et respectueuse, axée sur l'auto-grandissement de la colonne vertébrale, la protection du périnée et le renforcement des muscles profonds. Loin de la performance, nous cultivons la présence, la souplesse articulaire et la libération des tensions du dos.",
    benefits: [
      'Soulagement des douleurs dorsales et lombaires',
      'Renforcement de la sangle abdominale profonde sans hyperpression',
      "Amélioration de la mobilité articulaire et prévention de l'ostéoporose",
      'Respiration consciente (Pranayama) et apaisement du système nerveux',
    ],
    image: '/images/bouda-tailleur.jpg',
    trialPrice: '10 €',
  },
  {
    id: 'yoga-enfant',
    title: 'Yoga Enfants (6 à 14 ans)',
    subtitle: 'Exploration ludique, Brain Gym & gestion des émotions',
    category: 'enfant',
    groupSize: '8 à 10 enfants max',
    duration: '1h00',
    locationName: 'La Comète (Hésingue)',
    description:
      "Un rendez-vous hebdomadaire joyeux et structurant pour aider l'enfant à apprivoiser son corps, canaliser son énergie et cultiver sa confiance. Nous intégrons des mouvements de Brain Gym et de Brain Ball favorisant la coordination, l'attention scolaire et le retour au calme.",
    benefits: [
      "Développement de la motricité, de la souplesse et de l'équilibre",
      'Apprentissage de techniques simples de retour au calme et anti-stress',
      'Stimulation de la concentration par le Brain Ball et Brain Gym',
      'Éveil à la bienveillance envers soi-même et les autres',
    ],
    image: '/images/bouda-tailleur.jpg',
    trialPrice: 'Offerte',
  },
  {
    id: 'parent-enfant',
    title: 'Ateliers Yoga Parent-Enfant',
    subtitle: 'Moments complices, postures à deux & relaxation contée',
    category: 'parent-enfant',
    groupSize: 'Petits groupes en duo/trio',
    duration: '1h00',
    locationName: 'La Comète (Hésingue)',
    description:
      "Une parenthèse enchantée de complicité entre un adulte (parent, grand-parent) et un ou deux enfants. Au fil d'histoires féeriques et de jeux posturaux à deux, on s'étire, on rigole, on s'écoute et on termine par un massage doux ou une relaxation guidée.",
    benefits: [
      'Renforcement du lien affectif et de la confiance mutuelle',
      "Partage d'un temps calme de qualité hors des écrans",
      'Découverte sensorielle et corporelle par le jeu',
      'Outils de relaxation réutilisables à la maison au coucher',
    ],
    image: '/images/bouda-tailleur.jpg',
    trialPrice: '20 € / duo',
  },
  {
    id: 'cours-particulier',
    title: 'Séances Individuelles & Entreprises',
    subtitle: 'Accompagnement sur-mesure & Posturologie De Gasquet',
    category: 'particulier',
    groupSize: '1 à 2 personnes ou équipe',
    duration: '1h15',
    locationName: 'Mini-Studio ou Sur site / À domicile',
    description:
      "Une séance entièrement dédiée à vos besoins spécifiques : reprise d'activité, rééducation posturale douce, accompagnement pré/postnatal, gestion ciblée du stress ou ateliers bien-être en entreprise / pause méridienne.",
    benefits: [
      'Bilan postural personnalisé selon la méthode De Gasquet',
      'Adaptation fine aux antécédents de santé (hernies, sciatiques, scoliose)',
      'Rythme et créneaux horaires flexibles selon vos disponibilités',
      "Programme d'exercices personnalisés à emporter chez soi",
    ],
    image: '/images/bouda-tailleur.jpg',
    trialPrice: 'Sur devis',
  },
];
