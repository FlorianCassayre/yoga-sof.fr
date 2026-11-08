import { coursesTable } from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { COURSE_COLUMNS, COURSE_TYPES, courseLegacySchema } from './courseLegacySchemas';

interface CoursesImportResult {
  keptCourseIds: Set<number>;
  courses: number;
  canceledCourses: number;
  unsupportedCourses: number;
}

const legacyCourse = (row: MysqlValue[]) => parseLegacyRow(row, COURSE_COLUMNS, courseLegacySchema);

export const coursesImport = async (
  client: Client,
  rows: MysqlValue[][],
): Promise<CoursesImportResult> => {
  const courses = new Map<
    number,
    {
      type: 'adulte' | 'enfant';
      startsAt: Date;
      endsAt: Date;
      capacity: number;
      visibility: 'public' | 'private';
      internalNotes: string;
    }
  >();
  let canceledCourses = 0;
  let unsupportedCourses = 0;
  for (const legacy of rows.map(legacyCourse)) {
    const type = COURSE_TYPES[legacy.type];
    if (legacy.isCanceled) {
      canceledCourses++;
      continue;
    }
    if (!type) {
      unsupportedCourses++;
      continue;
    }
    courses.set(legacy.id, {
      type,
      startsAt: legacy.dateStart,
      endsAt: legacy.dateEnd,
      capacity: legacy.slots,
      visibility: legacy.visible ? 'public' : 'private',
      internalNotes: legacy.notes ?? '',
    });
  }
  const courseValues: InsertRow<typeof coursesTable>[] = [...courses].map(([id, course]) => ({
    id,
    version: 1,
    type: course.type,
    startsAt: course.startsAt,
    endsAt: course.endsAt,
    capacity: course.capacity,
    registeredCount: 0,
    visibility: course.visibility,
    internalNotes: course.internalNotes,
  }));
  await insertRows(client, coursesTable, courseValues, true);
  return {
    keptCourseIds: new Set(courses.keys()),
    courses: courseValues.length,
    canceledCourses,
    unsupportedCourses,
  };
};

// The registered counts are only known once the registrations are imported; align them
// afterwards, raising the capacity when a legacy course was overbooked.
export const reconcileRegisteredCounts = async (
  client: Client,
): Promise<{ capacityRaises: number }> => {
  const { rows } = await client.query<{ raises: number }>(`
    SELECT count(*)::int AS raises
    FROM (
      SELECT r."courseId", count(*)::int AS count
      FROM "course_user_registrations" r
      WHERE NOT r."canceled"
      GROUP BY r."courseId"
    ) counts
    JOIN "courses" c ON c.id = counts."courseId"
    WHERE counts.count > c."capacity"
  `);
  await client.query(`
    UPDATE "courses" SET
      "registeredCount" = counts.count,
      "capacity" = GREATEST("courses"."capacity", counts.count)
    FROM (
      SELECT "courseId", count(*)::int AS count
      FROM "course_user_registrations"
      WHERE NOT "canceled"
      GROUP BY "courseId"
    ) counts
    WHERE "courses"."id" = counts."courseId"
  `);
  return { capacityRaises: rows[0]?.raises ?? 0 };
};
