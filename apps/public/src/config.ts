import type { YogaCourse } from './types';

export const CONTACT_INFO = {
  teacher: 'Sophie Richaud-Cassayre',
  phone: '06 58 48 33 45',
  email: 'contact@yoga-sof.fr',
  socials: {
    facebook: 'https://facebook.com/yoga.sof.hesingue',
    instagram: 'https://instagram.com/yoga.sof.hesingue',
  },
};

export const COURSES: YogaCourse[] = [
  {
    id: 'hatha-adulte',
    title: 'Hatha Yoga & Yoga Sans Dégâts',
    subtitle: 'Approche physiologique certifiée De Gasquet',
    category: 'adulte',
    groupSize: '4 à 6 élèves max',
    duration: '1h15',
    locationName: 'Mini-Studio (8 rue des Moissonneurs)',
    locationAddress: '8 rue des Moissonneurs, 68220 Hésingue',
    description:
      "Une pratique de Hatha Yoga authentique et respectueuse, axée sur l'auto-grandissement de la colonne vertébrale, la protection du périnée et le renforcement des muscles profonds. Loin de la performance, nous cultivons la présence, la souplesse articulaire et la libération des tensions du dos.",
    benefits: [
      'Soulagement des douleurs dorsales et lombaires',
      'Renforcement de la sangle abdominale profonde sans hyperpression',
      "Amélioration de la mobilité articulaire et prévention de l'ostéoporose",
      'Respiration consciente (Pranayama) et apaisement du système nerveux',
    ],
    forWhom:
      'Adultes de tous âges et niveaux, du débutant absolu au pratiquant régulier, personnes ayant le dos sensible.',
    image: '/images/bouda-tailleur.jpg',
    accentColor: '#5A7163',
    trialPrice: '10 €',
    unitPrice: '16 €',
  },
  {
    id: 'yoga-enfant',
    title: 'Yoga Enfants (6 à 14 ans)',
    subtitle: 'Exploration ludique, Brain Gym & gestion des émotions',
    category: 'enfant',
    ageGroup: '6 - 14 ans',
    groupSize: '8 à 10 enfants max',
    duration: '1h00',
    locationName: 'La Comète (Hésingue)',
    locationAddress: '16 rue du 20 Novembre, 68220 Hésingue',
    description:
      "Un rendez-vous hebdomadaire joyeux et structurant pour aider l'enfant à apprivoiser son corps, canaliser son énergie et cultiver sa confiance. Nous intégrons des mouvements de Brain Gym et de Brain Ball favorisant la coordination, l'attention scolaire et le retour au calme.",
    benefits: [
      "Développement de la motricité, de la souplesse et de l'équilibre",
      'Apprentissage de techniques simples de retour au calme et anti-stress',
      'Stimulation de la concentration par le Brain Ball et Brain Gym',
      'Éveil à la bienveillance envers soi-même et les autres',
    ],
    forWhom:
      "Enfants du CP au collège souhaitant bouger, s'apaiser ou renforcer leur concentration.",
    image: '/images/bouda-tailleur.jpg',
    accentColor: '#C27D60',
    trialPrice: 'Offerte',
    unitPrice: '90 € / trim.',
  },
  {
    id: 'parent-enfant',
    title: 'Ateliers Yoga Parent-Enfant',
    subtitle: 'Moments complices, postures à deux & relaxation contée',
    category: 'parent-enfant',
    ageGroup: '3-6 ans & 6-10 ans',
    groupSize: 'Petits groupes en duo/trio',
    duration: '1h00',
    locationName: 'La Comète (Hésingue)',
    locationAddress: '16 rue du 20 Novembre, 68220 Hésingue',
    description:
      "Une parenthèse enchantée de complicité entre un adulte (parent, grand-parent) et un ou deux enfants. Au fil d'histoires féeriques et de jeux posturaux à deux, on s'étire, on rigole, on s'écoute et on termine par un massage doux ou une relaxation guidée.",
    benefits: [
      'Renforcement du lien affectif et de la confiance mutuelle',
      "Partage d'un temps calme de qualité hors des écrans",
      'Découverte sensorielle et corporelle par le jeu',
      'Outils de relaxation réutilisables à la maison au coucher',
    ],
    forWhom:
      'Duos ou trios parent-enfant (sessions différenciées 3-6 ans et 6-10 ans). Planning sur demande.',
    image: '/images/bouda-tailleur.jpg',
    accentColor: '#8C7D70',
    trialPrice: '20 € / duo',
    unitPrice: 'Atelier ponctuel',
  },
  {
    id: 'cours-particulier',
    title: 'Séances Individuelles & Entreprises',
    subtitle: 'Accompagnement sur-mesure & Posturologie De Gasquet',
    category: 'particulier',
    groupSize: '1 à 2 personnes ou équipe',
    duration: '1h15',
    locationName: 'Mini-Studio ou Sur site / À domicile',
    locationAddress: 'Hésingue et environs (Saint-Louis, Bâle)',
    description:
      "Une séance entièrement dédiée à vos besoins spécifiques : reprise d'activité, rééducation posturale douce, accompagnement pré/postnatal, gestion ciblée du stress ou ateliers bien-être en entreprise / pause méridienne.",
    benefits: [
      'Bilan postural personnalisé selon la méthode De Gasquet',
      'Adaptation fine aux antécédents de santé (hernies, sciatiques, scoliose)',
      'Rythme et créneaux horaires flexibles selon vos disponibilités',
      "Programme d'exercices personnalisés à emporter chez soi",
    ],
    forWhom:
      "Particuliers en quête d'un suivi individualisé ou comités d'entreprise soucieux de la QVT.",
    image: '/images/bouda-tailleur.jpg',
    accentColor: '#3F5246',
    trialPrice: 'Sur devis',
    unitPrice: '55 € / séance',
  },
];
