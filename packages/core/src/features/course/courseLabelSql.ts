import { sql } from 'drizzle-orm';

import { APP_TIMEZONE, MONTHS, WEEKDAYS } from '../../util/date';
import { coursesTable } from './coursesTable';
import { COURSE_TYPE_LABELS } from './type/courseTypeLabels';

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

const arrayLiteral = (values: string[]) => `ARRAY[${values.map(quote).join(',')}]`;

const typeCases = Object.entries(COURSE_TYPE_LABELS)
  .map(([type, label]) => `WHEN ${quote(type)} THEN ${quote(label.toLowerCase())}`)
  .join(' ');

const startsAtInAppTimezone = sql`(${coursesTable.startsAt} AT TIME ZONE ${APP_TIMEZONE})`;

export const courseLabelSql = sql`(
  'Séance ' ||
  CASE ${coursesTable.type} ${sql.raw(typeCases)} END ||
  ' du ' ||
  ${sql.raw(`(${arrayLiteral(WEEKDAYS)})`)}[1 + EXTRACT(DOW FROM ${startsAtInAppTimezone})::int] ||
  ' ' ||
  EXTRACT(DAY FROM ${startsAtInAppTimezone})::int ||
  ' ' ||
  ${sql.raw(`(${arrayLiteral(MONTHS)})`)}[EXTRACT(MONTH FROM ${startsAtInAppTimezone})::int] ||
  ' ' ||
  EXTRACT(YEAR FROM ${startsAtInAppTimezone})::int ||
  ' de ' ||
  to_char(${startsAtInAppTimezone}, 'HH24"h"mi') ||
  ' à ' ||
  to_char(${coursesTable.endsAt} AT TIME ZONE ${APP_TIMEZONE}, 'HH24"h"mi')
)`;
