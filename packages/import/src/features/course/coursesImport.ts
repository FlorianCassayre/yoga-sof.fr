import { coursesTable, registerablesTable } from '@yoga-sof/core';
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
    price: 0,
    visibility: course.visibility,
    internalNotes: course.internalNotes,
  }));
  await insertRows(client, coursesTable, courseValues, true);
  await insertRows(
    client,
    registerablesTable,
    [...courses.keys()].map((courseId) => ({
      courseId,
      capacity: courses.get(courseId)!.capacity,
    })),
  );
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
      FROM "registrations" r
      WHERE NOT r."canceled" AND r."courseId" IS NOT NULL
      GROUP BY r."courseId"
    ) counts
    JOIN "registerables" g ON g."courseId" = counts."courseId"
    WHERE counts.count > g."capacity"
  `);
  await client.query(`
    UPDATE "registerables" SET
      "registeredCount" = counts.count,
      "capacity" = GREATEST("registerables"."capacity", counts.count)
    FROM (
      SELECT "courseId", count(*)::int AS count
      FROM "registrations"
      WHERE NOT "canceled" AND "courseId" IS NOT NULL
      GROUP BY "courseId"
    ) counts
    WHERE "registerables"."courseId" = counts."courseId"
  `);
  return { capacityRaises: rows[0]?.raises ?? 0 };
};
