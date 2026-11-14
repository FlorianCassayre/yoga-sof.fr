import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

import { APP_TIMEZONE, appLocale } from '../../util/date';
import type { CourseType } from './type/CourseType';
import { COURSE_TYPE_LABELS } from './type/courseTypeLabels';

interface CourseLabelCourse {
  type: CourseType;
  startsAt: Date;
  endsAt: Date;
}

export const courseLabel = ({ type, startsAt, endsAt }: CourseLabelCourse): string =>
  `Séance ${COURSE_TYPE_LABELS[type].toLowerCase()} du ${format(new TZDate(startsAt, APP_TIMEZONE), 'EEEE d MMMM yyyy', { locale: appLocale })} de ${format(new TZDate(startsAt, APP_TIMEZONE), "HH'h'mm", { locale: appLocale })} à ${format(new TZDate(endsAt, APP_TIMEZONE), "HH'h'mm", { locale: appLocale })}`;
