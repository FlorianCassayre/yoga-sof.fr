import { CourseType } from '@prisma/client';
import { Link } from '@mui/material';
import { LocationComete, LocationHome } from '../src/common/config';
import React from 'react';
import { CourseDataExplicit } from '../src/components/contents/common/courses';

export const coursesExplicit: Record<CourseType, CourseDataExplicit> = {
  [CourseType.YOGA_ADULT]: {
    isRegistrationOnline: true,
    anchor: 'adulte',
    age: `Adultes`,
    level: `Tous niveaux`,
    group: `4-5 personnes`,
    duration: `1h15`,
    price: `360 € les 30 séances ou 130 € les 10 séances ou 15 € / scéance + cotisation annuelle association 15 € / personne ou 20 € / famille`,
    location: <>À mon domicile au <Link href={LocationHome.googleUrl} target="_blank" rel="noreferrer nofollow">8 rue des moissonneurs, 68220 Hésingue</Link>. Je peux également venir chez vous si vous constituez un petit groupe, n'hésitez pas à me contacter pour cela.</>,
    stuff: `Tapis de Yoga et une couverture, portez une tenue confortable. Vous pourrez emprunter sur place des blocs, sangles, élastiques, coussins, bolster, balles et ballons.`,
    registration: `Inscription en ligne depuis le site, ou bien me contacter`,
  },
  [CourseType.YOGA_CHILD]: {
    anchor: 'enfant',
    age: `6 à 12 ans`,
    level: `Initiation`,
    group: `6-8 enfants`,
    duration: `1h`,
    price: `90 €/ trimestre et cotisation 15 €/an pour l'association Yoga-Sof`,
    location: <Link href={LocationComete.googleUrl} target="_blank" rel="noreferrer nofollow">La Comète Salle Orion 16 Rue du 20 Novembre, 68220 Hésingue</Link>,
    stuff: `Venir directement après la classe en tenue souple et confortable qui ne serre pas au niveau de l'abdomen ; tapis, accessoires et autre matériel fournis`,
    registration: `Informations ou inscriptions me contacter pour faire connaissance avant la séance d'essai`,
  },
  [CourseType.YOGA_ADULT_CHILD]: {
    notStarted: true, // Pas encore commencé
    anchor: 'parent-enfant',
    age: `3 à 6 ans`,
    level: `Initiation`,
    group: `5 duos`,
    duration: `1h`,
    price: `20 € duos, 25 € pour 2 enfants`,
    location: `À définir`,
    stuff: `Venir en tenue souple et confortable qui ne sert pas au niveau de l'abdomen, apporter un tapis de yoga et une couverture.`,
    registration: `Informations ou inscriptions sur liste d'attente me contacter par mail`,
  },
};
