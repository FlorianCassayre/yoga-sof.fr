import { TZDate } from '@date-fns/tz';
import { and, asc, gt, gte, lt, max, ne } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { getRow, updateRow } from '../../db/rows';
import { assertConflict, assertInput } from '../../errors';
import {
  APP_TIMEZONE,
  formatScheduleDate,
  formatScheduleTime,
  type Weekday,
} from '../../util/date';
import { paginatedList } from '../../util/list';
import { courseLabelSql } from './courseLabelSql';
import type {
  courseBatchCreateSchema,
  courseCalendarListSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
} from './courseSchemas';
import { coursesTable } from './coursesTable';
import type { CourseTemplate } from './CourseTemplate';

const SUGGESTION_WEEKS = 3;

const pad = (value: number): string => String(value).padStart(2, '0');

const timeOfDay = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const lowerFirst = (value: string): string => value.charAt(0).toLowerCase() + value.slice(1);

const parisWeekStart = (instant: Date): TZDate => {
  const date = new TZDate(instant, APP_TIMEZONE);

  return new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - ((date.getDay() + 6) % 7),
    APP_TIMEZONE,
  );
};

const overlapMessage = ({ startsAt, endsAt }: { startsAt: Date; endsAt: Date }): string =>
  `La séance du ${lowerFirst(formatScheduleDate(startsAt))} de ${formatScheduleTime(startsAt)} à ${formatScheduleTime(endsAt)} chevauche une autre séance.`;

interface OverlapInput {
  startsAt: Date;
  endsAt: Date;
  excludeId?: number;
}

const findOverlaps = async (tx: DbTransaction, { startsAt, endsAt, excludeId }: OverlapInput) =>
  tx
    .select()
    .from(coursesTable)
    .where(
      and(
        lt(coursesTable.startsAt, endsAt),
        gt(coursesTable.endsAt, startsAt),
        excludeId === undefined ? undefined : ne(coursesTable.id, excludeId),
      ),
    );

const assertNoOverlap = async (tx: DbTransaction, input: OverlapInput): Promise<void> => {
  const [conflict] = await findOverlaps(tx, input);
  assertConflict(conflict === undefined, overlapMessage(input));
};

const parseWeek = (week: string): TZDate => {
  const [year = 1970, month = 1, day = 1] = week.split('-').map(Number);

  return parisWeekStart(new TZDate(year, month - 1, day, APP_TIMEZONE));
};

const batchCourse = (
  weekStart: TZDate,
  template: z.infer<typeof courseBatchCreateSchema>['templates'][number],
  visibility: z.infer<typeof courseBatchCreateSchema>['visibility'],
) => {
  const offset = (template.weekday + 6) % 7;
  const [startHours = 0, startMinutes = 0] = template.startTime.split(':').map(Number);
  const [endHours = 0, endMinutes = 0] = template.endTime.split(':').map(Number);
  const day = (hours: number, minutes: number) =>
    new TZDate(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() + offset,
      hours,
      minutes,
      APP_TIMEZONE,
    );

  return {
    type: template.type,
    startsAt: day(startHours, startMinutes),
    endsAt: day(endHours, endMinutes),
    capacity: template.capacity,
    visibility,
    internalNotes: '',
  };
};

const latestStart = async (tx: DbTransaction, before?: Date): Promise<Date | null> => {
  const [row] = await tx
    .select({ startsAt: max(coursesTable.startsAt) })
    .from(coursesTable)
    .where(before === undefined ? undefined : lt(coursesTable.startsAt, before));

  return row?.startsAt ?? null;
};

export const courseService = {
  list: (input: z.infer<typeof courseListSchema>, tx: DbTransaction) =>
    paginatedList<typeof coursesTable.$inferSelect>(tx, coursesTable, input, {
      searchColumns: [courseLabelSql],
      where: input.upcoming ? gt(coursesTable.endsAt, new Date()) : undefined,
    }),

  listCalendar: ({ start, end }: z.infer<typeof courseCalendarListSchema>, tx: DbTransaction) =>
    tx
      .select()
      .from(coursesTable)
      .where(and(gt(coursesTable.endsAt, start), lt(coursesTable.startsAt, end)))
      .orderBy(asc(coursesTable.startsAt)),

  get: ({ id }: z.infer<typeof courseGetSchema>, tx: DbTransaction) =>
    getRow<typeof coursesTable.$inferSelect>(tx, coursesTable, id, 'La séance est introuvable'),

  createBatch: async (values: z.infer<typeof courseBatchCreateSchema>, tx: DbTransaction) => {
    assertInput(values.templates.length > 0, 'Ajoutez au moins un créneau hebdomadaire.');
    assertInput(values.weeks.length > 0, 'Sélectionnez au moins une semaine.');

    const weekStarts = [...new Set(values.weeks.map(parseWeek))].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const generated = weekStarts
      .flatMap((weekStart) =>
        values.templates.map((template) => batchCourse(weekStart, template, values.visibility)),
      )
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    for (const course of generated) {
      assertInput(
        course.endsAt.getTime() > Date.now(),
        'La séance doit se terminer dans le futur.',
      );
    }

    const existing = await findOverlaps(tx, {
      startsAt: generated[0]!.startsAt,
      endsAt: generated[generated.length - 1]!.endsAt,
    });
    let maxEnd = new Date(0);
    for (const course of generated) {
      const clash =
        course.startsAt.getTime() < maxEnd.getTime() ||
        existing.some((row) => row.startsAt < course.endsAt && row.endsAt > course.startsAt);
      assertConflict(!clash, overlapMessage(course));
      if (course.endsAt.getTime() > maxEnd.getTime()) {
        maxEnd = course.endsAt;
      }
    }

    return tx.insert(coursesTable).values(generated).returning();
  },

  update: async (values: z.infer<typeof courseEditSchema>, tx: DbTransaction) => {
    const { id, startsAt, endsAt } = values;
    if (startsAt !== undefined && endsAt !== undefined) {
      await assertNoOverlap(tx, { startsAt, endsAt, excludeId: id });
    }

    return updateRow<typeof coursesTable.$inferSelect>(
      tx,
      coursesTable,
      values,
      'La séance a été modifiée entre-temps, rechargez la page.',
    );
  },

  suggestTemplates: async (tx: DbTransaction): Promise<CourseTemplate[]> => {
    const templates = new Map<string, CourseTemplate>();
    let cursor = await latestStart(tx);

    for (let week = 0; week < SUGGESTION_WEEKS && cursor !== null; week += 1) {
      const start = parisWeekStart(cursor);
      const end = new TZDate(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 7,
        APP_TIMEZONE,
      );
      const rows = await tx
        .select()
        .from(coursesTable)
        .where(and(gte(coursesTable.startsAt, start), lt(coursesTable.startsAt, end)));
      for (const row of rows) {
        const startsAt = new TZDate(row.startsAt, APP_TIMEZONE);
        const endsAt = new TZDate(row.endsAt, APP_TIMEZONE);
        const template: CourseTemplate = {
          weekday: startsAt.getDay() as Weekday,
          type: row.type,
          startTime: timeOfDay(startsAt),
          endTime: timeOfDay(endsAt),
          capacity: row.capacity,
        };
        const key = `${template.weekday}|${template.type}|${template.startTime}|${template.endTime}`;
        const existing = templates.get(key);
        if (existing === undefined || template.capacity > existing.capacity) {
          templates.set(key, template);
        }
      }
      cursor = await latestStart(tx, start);
    }

    return [...templates.values()].sort(
      (a, b) =>
        ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7) || a.startTime.localeCompare(b.startTime),
    );
  },
};
