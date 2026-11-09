import { courseUserWaitingListsTable } from '@yoga-sof/core';
import type { Client } from 'pg';

import { type InsertRow, insertRows } from '../../import/insertRows';
import { parseLegacyRow } from '../../parse/legacySchemas';
import type { MysqlValue } from '../../parse/parseMysqlDump';
import { EMAIL_COLUMNS, EMAIL_TYPES, emailLegacySchema } from '../email/emailLegacySchemas';
import {
  COURSE_WAITING_LIST_COLUMNS,
  courseWaitingListLegacySchema,
} from './courseWaitingListLegacySchemas';

interface CourseWaitingListImportResult {
  waitingListEntries: number;
  notifiedWaitingListEntries: number;
  duplicateWaitingListEntries: number;
  orphanWaitingListEntries: number;
}

const PARIS_WALL_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

// Paris wall-clock parts of an instant: the legacy subjects carry Paris
// wall-clock times, the courses store absolute instants.
const parisParts = (date: Date) => {
  const parts = PARIS_WALL_CLOCK.formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
  };
};

// Both sides key on the course type, the Paris start date+time and the end
// time (the subject carries no end date).
const slotKey = (
  type: string,
  start: { year: number; month: number; day: number; hour: number; minute: number },
  end: { hour: number; minute: number },
) =>
  `${type}-${start.year}-${start.month}-${start.day}-${start.hour}-${start.minute}-${end.hour}-${end.minute}`;

const MONTHS = [
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

// "Place disponible pour la séance yoga adulte du jeudi 6 mars 2025 de 16h30 à 17h45 - Yoga Sof"
const SUBJECT_PATTERN =
  /^Place disponible pour la .* du \S+ (\d{1,2}) (\p{L}+) (\d{4}) de (\d{1,2})h(\d{2}) à (\d{1,2})h(\d{2})/u;

const legacyWaitingListEntry = (row: MysqlValue[]) =>
  parseLegacyRow(row, COURSE_WAITING_LIST_COLUMNS, courseWaitingListLegacySchema);

// Identifies the course a waiting-list e-mail is about through the course
// label embedded in its subject — the legacy e-mail rows carry no course id.
const notifiedEntries = async (
  client: Client,
  userIds: Map<number, string>,
  legacyEmails: MysqlValue[][],
): Promise<Map<string, Date>> => {
  const courseRows = await client.query<{ id: number; type: string; startsAt: Date; endsAt: Date }>(
    'SELECT id, type, "startsAt", "endsAt" FROM courses',
  );
  const courseIdBySlot = new Map<string, number>();
  for (const course of courseRows.rows) {
    const start = parisParts(course.startsAt);
    const end = parisParts(course.endsAt);
    courseIdBySlot.set(slotKey(course.type, start, end), course.id);
  }

  const notifications = new Map<string, Date>();
  for (const row of legacyEmails) {
    const email = parseLegacyRow(row, EMAIL_COLUMNS, emailLegacySchema);
    if (EMAIL_TYPES[email.type] !== 'courseWaitingList' || email.subject === null) {
      continue;
    }
    const match = SUBJECT_PATTERN.exec(email.subject);
    if (!match) {
      continue;
    }
    const [
      ,
      day = '',
      monthName = '',
      year = '',
      startHour = '',
      startMinute = '',
      endHour = '',
      endMinute = '',
    ] = match;
    const month = MONTHS.indexOf(monthName.toLowerCase()) + 1;
    if (month === 0) {
      continue;
    }
    const type = email.subject.includes('enfant') ? 'enfant' : 'adulte';
    const courseId = courseIdBySlot.get(
      slotKey(
        type,
        {
          year: Number(year),
          month,
          day: Number(day),
          hour: Number(startHour),
          minute: Number(startMinute),
        },
        { hour: Number(endHour), minute: Number(endMinute) },
      ),
    );
    if (courseId === undefined || !userIds.has(email.userId)) {
      continue;
    }
    const userId = userIds.get(email.userId)!;
    const key = `${courseId}:${userId}`;
    const earliest = notifications.get(key);
    if (!earliest || email.createdAt.getTime() < earliest.getTime()) {
      notifications.set(key, email.createdAt);
    }
  }
  return notifications;
};

// The legacy cron notified an entry by e-mailing the user and then canceling
// it (every canceled_at in the data is cron-stamped), so a canceled entry is
// notified with the cancellation instant, and an active entry is notified
// when a COURSE_WAITING_LIST e-mail matches its course (the entry stayed
// active in a few legacy cases).
export const courseWaitingListImport = async (
  client: Client,
  rows: MysqlValue[][],
  legacyEmails: MysqlValue[][],
  userIds: Map<number, string>,
  keptCourseIds: Set<number>,
): Promise<CourseWaitingListImportResult> => {
  const notifications = await notifiedEntries(client, userIds, legacyEmails);

  const entries: InsertRow<typeof courseUserWaitingListsTable>[] = [];
  const seen = new Set<string>();
  let notifiedWaitingListEntries = 0;
  let duplicateWaitingListEntries = 0;
  let orphanWaitingListEntries = 0;
  for (const legacy of rows.map(legacyWaitingListEntry)) {
    const userId = userIds.get(legacy.userId);
    if (!keptCourseIds.has(legacy.courseId) || !userId) {
      orphanWaitingListEntries++;
      continue;
    }
    const notifiedAt =
      legacy.canceledAt ?? notifications.get(`${legacy.courseId}:${userId}`) ?? null;
    const key = `${legacy.courseId}:${legacy.userId}`;
    if (seen.has(key)) {
      duplicateWaitingListEntries++;
      continue;
    }
    seen.add(key);
    if (notifiedAt) {
      notifiedWaitingListEntries++;
    }
    entries.push({
      id: legacy.id,
      courseId: legacy.courseId,
      userId,
      notified: notifiedAt !== null,
      notifiedAt,
      createdAt: legacy.createdAt,
    });
  }
  await insertRows(client, courseUserWaitingListsTable, entries, true);
  return {
    waitingListEntries: entries.length,
    notifiedWaitingListEntries,
    duplicateWaitingListEntries,
    orphanWaitingListEntries,
  };
};
