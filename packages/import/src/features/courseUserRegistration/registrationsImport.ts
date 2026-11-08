import { courseUserRegistrationsTable } from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { REGISTRATION_COLUMNS, registrationLegacySchema } from './registrationLegacySchemas';

interface RegistrationsImportResult {
  registrations: number;
  duplicateRegistrations: number;
  orphanRegistrations: number;
  pendingAttendance: number;
}

const legacyRegistration = (row: MysqlValue[]) =>
  parseLegacyRow(row, REGISTRATION_COLUMNS, registrationLegacySchema);

export const registrationsImport = async (
  client: Client,
  rows: MysqlValue[][],
  userIds: Map<number, string>,
  keptCourseIds: Set<number>,
): Promise<RegistrationsImportResult> => {
  const registrations: InsertRow<typeof courseUserRegistrationsTable>[] = [];
  const seenActive = new Set<string>();
  const pendingAttendance = new Set<number>();
  let duplicateRegistrations = 0;
  let orphanRegistrations = 0;
  for (const legacy of rows.map(legacyRegistration)) {
    const userId = userIds.get(legacy.userId);
    if (!keptCourseIds.has(legacy.courseId) || !userId) {
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
      canceledAt: canceled ? legacy.canceledAt : null,
      canceledBy: canceled ? userId : null,
      present: legacy.attended === null ? null : legacy.attended === 1,
      createdAt: legacy.createdAt,
    });
  }
  await insertRows(client, courseUserRegistrationsTable, registrations, true);
  return {
    registrations: registrations.length,
    duplicateRegistrations,
    orphanRegistrations,
    pendingAttendance: pendingAttendance.size,
  };
};
