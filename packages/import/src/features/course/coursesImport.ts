import { coursesTable, courseUserRegistrationsTable } from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyCourseInstant, parseLegacyDateTime } from '../../parse/legacyDateTime';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { COURSE_COLUMNS, COURSE_TYPES, REGISTRATION_COLUMNS } from './courseSchemas';

interface CoursesImportResult {
  courses: number;
  registrations: number;
  duplicateRegistrations: number;
  capacityRaises: number;
  canceledCourses: number;
  unsupportedCourses: number;
  orphanRegistrations: number;
  pendingAttendance: number;
}

const legacyCourse = (row: MysqlValue[]) => ({
  id: row[COURSE_COLUMNS.id] as number,
  type: row[COURSE_COLUMNS.type] as string,
  slots: row[COURSE_COLUMNS.slots] as number,
  dateStart: row[COURSE_COLUMNS.date_start] as string,
  dateEnd: row[COURSE_COLUMNS.date_end] as string,
  isCanceled: row[COURSE_COLUMNS.is_canceled] as number,
  notes: row[COURSE_COLUMNS.notes] as string | null,
  visible: row[COURSE_COLUMNS.visible] as number,
});

const legacyRegistration = (row: MysqlValue[]) => ({
  id: row[REGISTRATION_COLUMNS.id] as number,
  userId: row[REGISTRATION_COLUMNS.user_id] as number,
  courseId: row[REGISTRATION_COLUMNS.course_id] as number,
  isUserCanceled: row[REGISTRATION_COLUMNS.is_user_canceled] as number,
  createdAt: row[REGISTRATION_COLUMNS.created_at] as string,
  canceledAt: row[REGISTRATION_COLUMNS.canceled_at] as string | null,
  attended: row[REGISTRATION_COLUMNS.attended] as number | null,
});

export const coursesImport = async (
  client: Client,
  courseRows: MysqlValue[][],
  registrationRows: MysqlValue[][],
  userIds: Map<number, string>,
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
  const counters = { canceledCourses: 0, unsupportedCourses: 0 };
  for (const legacy of courseRows.map(legacyCourse)) {
    const type = COURSE_TYPES[legacy.type as keyof typeof COURSE_TYPES];
    if (legacy.isCanceled) {
      counters.canceledCourses++;
      continue;
    }
    if (!type) {
      counters.unsupportedCourses++;
      continue;
    }
    courses.set(legacy.id, {
      type,
      startsAt: parseLegacyCourseInstant(legacy.dateStart),
      endsAt: parseLegacyCourseInstant(legacy.dateEnd),
      capacity: legacy.slots,
      visibility: legacy.visible ? 'public' : 'private',
      internalNotes: legacy.notes ?? '',
    });
  }

  const registrations: InsertRow<typeof courseUserRegistrationsTable>[] = [];
  const activeCounts = new Map<number, number>();
  const seenActive = new Set<string>();
  const pendingAttendance = new Set<number>();
  let duplicateRegistrations = 0;
  let orphanRegistrations = 0;
  for (const legacy of registrationRows.map(legacyRegistration)) {
    const course = courses.get(legacy.courseId);
    const userId = userIds.get(legacy.userId);
    if (!course || !userId) {
      orphanRegistrations++;
      continue;
    }
    const canceled = legacy.isUserCanceled === 1;
    if (!canceled) {
      const key = `${legacy.courseId}:${legacy.userId}`;
      if (seenActive.has(key)) {
        duplicateRegistrations++;
        continue;
      }
      seenActive.add(key);
      activeCounts.set(legacy.courseId, (activeCounts.get(legacy.courseId) ?? 0) + 1);
      if (legacy.attended === null) {
        pendingAttendance.add(legacy.courseId);
      }
    }
    registrations.push({
      id: legacy.id,
      version: 1,
      courseId: legacy.courseId,
      userId,
      canceled,
      canceledAt: canceled ? parseLegacyDateTime(legacy.canceledAt) : null,
      canceledBy: canceled ? userId : null,
      present: legacy.attended === null ? null : legacy.attended === 1,
      createdAt: parseLegacyDateTime(legacy.createdAt)!,
    });
  }

  const courseValues: InsertRow<typeof coursesTable>[] = [];
  let capacityRaises = 0;
  for (const [id, course] of courses) {
    const registeredCount = activeCounts.get(id) ?? 0;
    const capacity = Math.max(course.capacity, registeredCount);
    if (capacity > course.capacity) {
      capacityRaises++;
    }
    courseValues.push({
      id,
      version: 1,
      type: course.type,
      startsAt: course.startsAt,
      endsAt: course.endsAt,
      capacity,
      registeredCount,
      visibility: course.visibility,
      internalNotes: course.internalNotes,
    });
  }
  await insertRows(client, coursesTable, courseValues, true);
  await insertRows(client, courseUserRegistrationsTable, registrations, true);

  return {
    courses: courseValues.length,
    registrations: registrations.length,
    duplicateRegistrations,
    capacityRaises,
    canceledCourses: counters.canceledCourses,
    unsupportedCourses: counters.unsupportedCourses,
    orphanRegistrations,
    pendingAttendance: pendingAttendance.size,
  };
};
