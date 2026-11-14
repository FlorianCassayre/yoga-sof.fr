import type { SQL, SQLWrapper } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import { APP_TIMEZONE, MONTHS, WEEKDAYS } from '../../util/date';
import { COURSE_TYPE_LABELS } from './type/courseTypeLabels';

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

const arrayLiteral = (values: string[]) => `ARRAY[${values.map(quote).join(',')}]`;

const typeCases = Object.entries(COURSE_TYPE_LABELS)
  .map(([type, label]) => `WHEN ${quote(type)} THEN ${quote(label.toLowerCase())}`)
  .join(' ');

export const courseLabelSql = (
  type: SQLWrapper,
  startsAt: SQLWrapper,
  endsAt: SQLWrapper,
): SQL => sql`(
  'Séance ' ||
  CASE ${type} ${sql.raw(typeCases)} END ||
  ' du ' ||
  ${sql.raw(`(${arrayLiteral(WEEKDAYS)})`)}[1 + EXTRACT(DOW FROM (${startsAt} AT TIME ZONE ${APP_TIMEZONE}))::int] ||
  ' ' ||
  EXTRACT(DAY FROM (${startsAt} AT TIME ZONE ${APP_TIMEZONE}))::int ||
  ' ' ||
  ${sql.raw(`(${arrayLiteral(MONTHS)})`)}[EXTRACT(MONTH FROM (${startsAt} AT TIME ZONE ${APP_TIMEZONE}))::int] ||
  ' ' ||
  EXTRACT(YEAR FROM (${startsAt} AT TIME ZONE ${APP_TIMEZONE}))::int ||
  ' de ' ||
  to_char(${startsAt} AT TIME ZONE ${APP_TIMEZONE}, 'HH24"h"mi') ||
  ' à ' ||
  to_char(${endsAt} AT TIME ZONE ${APP_TIMEZONE}, 'HH24"h"mi')
)`;
