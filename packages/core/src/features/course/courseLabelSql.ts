import { sql } from 'drizzle-orm';

import { coursesTable } from './coursesTable';
import { COURSE_TYPE_LABELS } from './type/courseTypeLabels';

const FRENCH_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const FRENCH_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

const arrayLiteral = (values: string[]) => `ARRAY[${values.map(quote).join(',')}]`;

const typeCases = Object.entries(COURSE_TYPE_LABELS)
  .map(([type, label]) => `WHEN ${quote(type)} THEN ${quote(label.toLowerCase())}`)
  .join(' ');

const startsAtParis = sql`(${coursesTable.startsAt} AT TIME ZONE 'Europe/Paris')`;

export const courseLabelSql = sql`(
  'Séance ' ||
  CASE ${coursesTable.type} ${sql.raw(typeCases)} END ||
  ' du ' ||
  ${sql.raw(`(${arrayLiteral(FRENCH_DAYS)})`)}[1 + EXTRACT(DOW FROM ${startsAtParis})::int] ||
  ' ' ||
  EXTRACT(DAY FROM ${startsAtParis})::int ||
  ' ' ||
  ${sql.raw(`(${arrayLiteral(FRENCH_MONTHS)})`)}[EXTRACT(MONTH FROM ${startsAtParis})::int] ||
  ' ' ||
  EXTRACT(YEAR FROM ${startsAtParis})::int ||
  ' de ' ||
  to_char(${startsAtParis}, 'HH24"h"mi') ||
  ' à ' ||
  to_char(${coursesTable.endsAt} AT TIME ZONE 'Europe/Paris', 'HH24"h"mi')
)`;
