import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/newCourse';

interface CourseDataExplicit {
  notStarted?: boolean;
  age: string;
  level: string;
  group: string;
  duration: string;
  price: string;
  location: string;
  stuff: string;
  registration: string;
}

interface CourseData extends CourseDataExplicit {
  notStarted: boolean;
  type: CourseType;
  title: string;
}

const coursesExplicit: Record<CourseType, CourseDataExplicit> = {
  [CourseType.YOGA_ADULT]: {
    age: `Adultes`,
    level: `Tous niveaux`,
    group: `4-5 personnes`,
    duration: `1h15`,
    price: `13 € / scéance ou 120 € les 10 séances + cotisation association 10 € / personne ou 15 € / famille`,
    location: `À mon domicile au 8 rue des moissonneurs, 68220 Hésingue. Je peux également venir chez vous si vous constituez un petit groupe, n'hésitez pas à me contacter pour cela.`,
    stuff: `Tapis de Yoga et une couverture, portez une tenue confortable. Vous pourrez emprunter sur place des blocs, sangles, coussins, balles et ballons.`,
    registration: `Inscription en ligne depuis le site, ou bien me contacter`,
  },
  [CourseType.YOGA_CHILD]: {
    age: `6 à 11 ans`,
    level: `Initiation`,
    group: `6-8 enfants`,
    duration: `1h`,
    price: `90€/ trimestre et cotisation 10€/an pour l'association Yoga-Sof, en cours de conventionnement pour les coupons sport`,
    location: `La Comète Salle Orion 16 Rue du 20 Novembre, 68220 Hésingue`,
    stuff: `Venir directement après la classe en tenue souple et confortable qui ne serre pas au niveau de l'abdomen ; tapis, accessoires et autre matériel fournis`,
    registration: `Informations ou inscriptions me contacter pour une première séance d'essai offerte`,
  },
  [CourseType.YOGA_ADULT_CHILD]: {
    notStarted: true, // Pas encore commencé
    age: `3 à 6 ans`,
    level: `Initiation`,
    group: `5 duos`,
    duration: `1h`,
    price: `À définir`,
    location: `À définir`,
    stuff: `Venir en tenue souple et confortable qui ne sert pas au niveau de l'abdomen, apporter un tapis de yoga et une couverture.`,
    registration: `Informations ou inscriptions sur liste d'attente me contacter`,
  },
};

export const courses: Record<CourseType, CourseData> =
  Object.fromEntries(Object.entries(coursesExplicit).map(([key, value]) =>
    [key, { ...value, type: key, title: CourseTypeNames[key as CourseType], notStarted: !!value.notStarted }])
  ) as Record<CourseType, CourseData>;
