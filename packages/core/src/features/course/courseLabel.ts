import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { coursesTable } from './coursesTable';
import { COURSE_TYPE_LABELS } from './type/courseTypeLabels';

type CourseLabelCourse = Pick<typeof coursesTable.$inferSelect, 'type' | 'startsAt' | 'endsAt'>;

export const courseLabel = ({ type, startsAt, endsAt }: CourseLabelCourse): string =>
  `Séance ${COURSE_TYPE_LABELS[type].toLowerCase()} du ${format(startsAt, 'EEEE d MMMM yyyy', { locale: fr })} de ${format(startsAt, "HH'h'mm", { locale: fr })} à ${format(endsAt, "HH'h'mm", { locale: fr })}`;
