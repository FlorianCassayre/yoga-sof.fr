import { TZDate } from '@date-fns/tz';
import {
  and,
  asc,
  count,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  max,
  ne,
  notExists,
  or,
  type SQL,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { updateRow } from '../../db/rows';
import { assertConflict, assertFound, assertInput, assertState } from '../../errors';
import {
  APP_TIMEZONE,
  formatScheduleDate,
  formatScheduleTime,
  type Weekday,
} from '../../util/date';
import { pagination, sortOrders } from '../../util/list';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';
import { registerablesTable } from '../registerable/registerablesTable';
import { courseUserPresencesTable, registrationsTable } from '../registration/registrationsTable';
import { courseLabelSql } from './courseLabelSql';
import type {
  courseBatchCreateSchema,
  courseCalendarListSchema,
  courseCancelSchema,
  courseEditSchema,
  courseGetSchema,
  courseListSchema,
} from './courseSchemas';
import { coursesTable } from './coursesTable';
import type { CourseTemplate } from './CourseTemplate';
import { COURSE_TYPE_REGISTRATION_MODES } from './type/courseRegistrationModes';
import type { CourseType } from './type/CourseType';

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

const effectiveType = sql<CourseType>`coalesce(${coursesTable.type}, ${courseBundlesTable.type})`;

const aliasedBundleCourses = alias(coursesTable, 'bundle_courses');

// Registrations covering a course: a lot registration covers every course of
// its lot.
const coveringRegistrations = (tx: DbTransaction) =>
  and(
    eq(registrationsTable.canceled, false),
    or(
      eq(registrationsTable.courseId, coursesTable.id),
      inArray(
        registrationsTable.courseBundleId,
        tx
          .select({ id: aliasedBundleCourses.courseBundleId })
          .from(aliasedBundleCourses)
          .where(
            and(
              eq(aliasedBundleCourses.id, coursesTable.id),
              isNotNull(aliasedBundleCourses.courseBundleId),
            ),
          ),
      ),
    ),
  );

const courseListQuery = (tx: DbTransaction) => {
  const coveredRegistrations = coveringRegistrations(tx);
  const presenceRow = (present: boolean) =>
    tx
      .select({ id: courseUserPresencesTable.registrationId })
      .from(courseUserPresencesTable)
      .where(
        and(
          eq(courseUserPresencesTable.registrationId, registrationsTable.id),
          eq(courseUserPresencesTable.courseId, coursesTable.id),
          eq(courseUserPresencesTable.present, present),
        ),
      );
  const coveringCount = (field: 'present' | 'absent', filter: SQL) =>
    sql<number>`${tx
      .select({ [field]: count() })
      .from(registrationsTable)
      .where(and(coveredRegistrations, filter))}`.mapWith(Number);
  const pendingCount = sql<number>`${tx
    .select({ pending: count() })
    .from(registrationsTable)
    .where(
      and(
        coveredRegistrations,
        notExists(
          tx
            .select({ id: courseUserPresencesTable.registrationId })
            .from(courseUserPresencesTable)
            .where(
              and(
                eq(courseUserPresencesTable.registrationId, registrationsTable.id),
                eq(courseUserPresencesTable.courseId, coursesTable.id),
              ),
            ),
        ),
      ),
    )}`.mapWith(Number);

  return tx
    .select({
      id: coursesTable.id,
      version: coursesTable.version,
      type: effectiveType,
      price: coursesTable.price,
      courseBundleId: coursesTable.courseBundleId,
      bundleLabel: courseBundlesTable.label,
      startsAt: coursesTable.startsAt,
      endsAt: coursesTable.endsAt,
      visibility: coursesTable.visibility,
      internalNotes: coursesTable.internalNotes,
      capacity: registerablesTable.capacity,
      registeredCount: registerablesTable.registeredCount,
      canceled: coursesTable.canceled,
      canceledAt: coursesTable.canceledAt,
      canceledBy: coursesTable.canceledBy,
      cancellationReason: coursesTable.cancellationReason,
      pending: pendingCount,
      present: coveringCount('present', exists(presenceRow(true))),
      absent: coveringCount('absent', exists(presenceRow(false))),
    })
    .from(coursesTable)
    .leftJoin(
      registerablesTable,
      or(
        eq(registerablesTable.courseId, coursesTable.id),
        eq(registerablesTable.courseBundleId, coursesTable.courseBundleId),
      ),
    )
    .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId));
};

const LIST_ORDER_COLUMNS = {
  bundleLabel: courseBundlesTable.label,
  capacity: registerablesTable.capacity,
  endsAt: coursesTable.endsAt,
  price: coursesTable.price,
  registeredCount: registerablesTable.registeredCount,
  startsAt: coursesTable.startsAt,
  type: effectiveType,
  visibility: coursesTable.visibility,
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
        eq(coursesTable.canceled, false),
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
    type: template.bundleId === undefined ? (template.type ?? null) : null,
    courseBundleId: template.bundleId,
    price: template.bundleId === undefined ? (template.price ?? null) : null,
    startsAt: day(startHours, startMinutes),
    endsAt: day(endHours, endMinutes),
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
  list: async (
    {
      sort,
      upcoming,
      courseBundleId,
      individual,
      search,
      ...params
    }: z.infer<typeof courseListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where = and(
      upcoming === undefined ? undefined : gt(coursesTable.endsAt, new Date()),
      courseBundleId === undefined ? undefined : eq(coursesTable.courseBundleId, courseBundleId),
      individual === undefined || !individual ? undefined : isNull(coursesTable.courseBundleId),
      search === undefined
        ? undefined
        : ilike(
            courseLabelSql(effectiveType, coursesTable.startsAt, coursesTable.endsAt),
            `%${search}%`,
          ),
    );
    const rows = await courseListQuery(tx)
      .where(where)
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx
      .select({ total: count() })
      .from(coursesTable)
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId))
      .where(where);

    return { rows, total: totals?.total ?? 0 };
  },

  listCalendar: ({ start, end }: z.infer<typeof courseCalendarListSchema>, tx: DbTransaction) =>
    tx
      .select({
        id: coursesTable.id,
        type: effectiveType,
        startsAt: coursesTable.startsAt,
        endsAt: coursesTable.endsAt,
      })
      .from(coursesTable)
      .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId))
      .where(
        and(
          eq(coursesTable.canceled, false),
          gt(coursesTable.endsAt, start),
          lt(coursesTable.startsAt, end),
        ),
      )
      .orderBy(asc(coursesTable.startsAt)),

  get: async ({ id }: z.infer<typeof courseGetSchema>, tx: DbTransaction) => {
    const [row] = await courseListQuery(tx).where(eq(coursesTable.id, id));
    assertFound(row, 'La séance est introuvable');

    return row;
  },

  createBatch: async (values: z.infer<typeof courseBatchCreateSchema>, tx: DbTransaction) => {
    assertInput(values.templates.length > 0, 'Ajoutez au moins un créneau hebdomadaire.');
    assertInput(values.weeks.length > 0, 'Sélectionnez au moins une semaine.');

    const bundleIds = [
      ...new Set(
        values.templates
          .map((template) => template.bundleId)
          .filter((bundleId) => bundleId !== undefined),
      ),
    ];
    const bundleRows =
      bundleIds.length > 0
        ? await tx
            .select({ id: courseBundlesTable.id, type: courseBundlesTable.type })
            .from(courseBundlesTable)
            .where(inArray(courseBundlesTable.id, bundleIds))
        : [];
    assertInput(
      bundleRows.length === bundleIds.length,
      'Certains lots de séances sont introuvables.',
    );
    assertInput(
      bundleRows.every((bundle) => COURSE_TYPE_REGISTRATION_MODES[bundle.type] === 'bundle'),
      'Ce type de lot de séances ne peut pas contenir de séances.',
    );
    assertInput(
      values.templates.every(
        (template) => template.bundleId !== undefined || template.type !== undefined,
      ),
      'Le type est requis.',
    );
    assertInput(
      values.templates.every(
        (template) =>
          template.bundleId !== undefined ||
          (template.type !== undefined &&
            COURSE_TYPE_REGISTRATION_MODES[template.type] === 'individual'),
      ),
      'Les séances enfant ne peuvent être créées que dans un lot de séances.',
    );
    assertInput(
      values.templates.every(
        (template) => template.bundleId !== undefined || template.price !== undefined,
      ),
      'Le prix est requis.',
    );
    const batchBundleIds = [
      ...new Set(
        values.templates
          .map((template) => template.bundleId)
          .filter((bundleId) => bundleId !== undefined),
      ),
    ];
    if (batchBundleIds.length > 0) {
      assertInput(values.capacity !== undefined, 'La capacité est requise.');
      for (const bundleId of batchBundleIds) {
        const [registerable] = await tx
          .select()
          .from(registerablesTable)
          .where(eq(registerablesTable.courseBundleId, bundleId));
        assertState(registerable, 'Le lot de séances est introuvable.');
        assertInput(
          values.capacity >= registerable.registeredCount,
          "La capacité ne peut être inférieure au nombre d'inscrits.",
        );
        await tx
          .update(registerablesTable)
          .set({ capacity: values.capacity })
          .where(eq(registerablesTable.id, registerable.id));
      }
    }

    const weekStarts = [...new Set(values.weeks.map(parseWeek))].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const generated = weekStarts
      .flatMap((weekStart) =>
        values.templates.map((template) => ({
          course: batchCourse(weekStart, template, values.visibility),
          capacity: template.bundleId === undefined ? template.capacity : undefined,
        })),
      )
      .sort((a, b) => a.course.startsAt.getTime() - b.course.startsAt.getTime());
    for (const { course } of generated) {
      assertInput(
        course.endsAt.getTime() > Date.now(),
        'La séance doit se terminer dans le futur.',
      );
    }

    const existing = await findOverlaps(tx, {
      startsAt: generated[0]!.course.startsAt,
      endsAt: generated[generated.length - 1]!.course.endsAt,
    });
    let maxEnd = new Date(0);
    for (const { course } of generated) {
      const clash =
        course.startsAt.getTime() < maxEnd.getTime() ||
        existing.some((row) => row.startsAt < course.endsAt && row.endsAt > course.startsAt);
      assertConflict(!clash, overlapMessage(course));
      if (course.endsAt.getTime() > maxEnd.getTime()) {
        maxEnd = course.endsAt;
      }
    }

    const created = await tx
      .insert(coursesTable)
      .values(generated.map(({ course }) => course))
      .returning();
    const individualRegisterables = created.flatMap((row, index) => {
      const capacity = generated[index]!.capacity;

      return capacity === undefined ? [] : [{ courseId: row.id, capacity }];
    });
    if (individualRegisterables.length > 0) {
      await tx.insert(registerablesTable).values(individualRegisterables);
    }

    return created;
  },

  cancel: async (
    { id, cancellationReason }: z.infer<typeof courseCancelSchema>,
    tx: DbTransaction,
    canceledBy: string,
  ) => {
    const [row] = await tx.select().from(coursesTable).where(eq(coursesTable.id, id));
    assertFound(row, 'La séance est introuvable.');
    assertConflict(!row.canceled, 'La séance est déjà annulée.');

    const changes = {
      canceled: true,
      canceledAt: new Date(),
      canceledBy,
      cancellationReason: cancellationReason?.trim() ?? null,
    };

    await updateRow<typeof coursesTable.$inferSelect>(
      tx,
      coursesTable,
      { id, version: row.version, ...changes },
      'La séance a été modifiée entre-temps, rechargez la page.',
    );
    const [updated] = await courseListQuery(tx).where(eq(coursesTable.id, id));
    assertState(updated, 'La séance est introuvable.');

    return updated;
  },

  update: async (values: z.infer<typeof courseEditSchema>, tx: DbTransaction) => {
    const { capacity, ...courseValues } = values;
    const { id } = courseValues;
    if (courseValues.startsAt !== undefined && courseValues.endsAt !== undefined) {
      await assertNoOverlap(tx, {
        startsAt: courseValues.startsAt,
        endsAt: courseValues.endsAt,
        excludeId: id,
      });
    }
    if (capacity !== undefined) {
      const [registerable] = await tx
        .select()
        .from(registerablesTable)
        .where(eq(registerablesTable.courseId, id));
      assertState(registerable, "La séance n'est pas enregistrable.");
      assertInput(
        capacity >= registerable.registeredCount,
        "La capacité ne peut être inférieure au nombre d'inscrits.",
      );
      await tx
        .update(registerablesTable)
        .set({ capacity })
        .where(eq(registerablesTable.id, registerable.id));
    }

    const updated = await updateRow<typeof coursesTable.$inferSelect>(
      tx,
      coursesTable,
      courseValues,
      'La séance a été modifiée entre-temps, rechargez la page.',
    );
    const [row] = await courseListQuery(tx).where(eq(coursesTable.id, updated.id));
    assertState(row, 'La séance est introuvable.');

    return row;
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
        .select({
          type: effectiveType,
          bundleId: coursesTable.courseBundleId,
          startsAt: coursesTable.startsAt,
          endsAt: coursesTable.endsAt,
          capacity: registerablesTable.capacity,
          price: coursesTable.price,
        })
        .from(coursesTable)
        .leftJoin(
          registerablesTable,
          or(
            eq(registerablesTable.courseId, coursesTable.id),
            eq(registerablesTable.courseBundleId, coursesTable.courseBundleId),
          ),
        )
        .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId))
        .where(and(gte(coursesTable.startsAt, start), lt(coursesTable.startsAt, end)));
      for (const row of rows) {
        if (COURSE_TYPE_REGISTRATION_MODES[row.type] !== 'individual') {
          continue;
        }
        const startsAt = new TZDate(row.startsAt, APP_TIMEZONE);
        const endsAt = new TZDate(row.endsAt, APP_TIMEZONE);
        const template: CourseTemplate = {
          weekday: startsAt.getDay() as Weekday,
          type: row.type,
          bundleId: row.bundleId ?? undefined,
          startTime: timeOfDay(startsAt),
          endTime: timeOfDay(endsAt),
          capacity: row.capacity,
          price: row.price,
        };
        const key = `${template.weekday}|${template.bundleId ?? template.type}|${template.startTime}|${template.endTime}`;
        const existing = templates.get(key);
        if (existing === undefined || (template.capacity ?? 0) > (existing.capacity ?? 0)) {
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
