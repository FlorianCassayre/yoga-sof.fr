import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { DbTransaction } from '../../../db/db';
import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { courseLabel } from '../../../features/course/courseLabel';
import { courseLabelSql } from '../../../features/course/courseLabelSql';
import { courseService } from '../../../features/course/courseService';
import { coursesTable } from '../../../features/course/coursesTable';
import type { CourseType } from '../../../features/course/type/CourseType';

const MARKER = 'courseLabelSql-test';

interface LabelCase {
  type: CourseType;
  startsAt: string;
  endsAt: string;
  label: string;
}

const CASES: LabelCase[] = [
  {
    type: 'adulte',
    startsAt: '2026-11-12T09:45:00Z',
    endsAt: '2026-11-12T11:00:00Z',
    label: 'Séance yoga adultes du jeudi 12 novembre 2026 de 10h45 à 12h00',
  },
  {
    type: 'enfant',
    startsAt: '2026-06-15T07:30:00Z',
    endsAt: '2026-06-15T08:30:00Z',
    label: 'Séance yoga enfants du lundi 15 juin 2026 de 09h30 à 10h30',
  },
  {
    type: 'adulte',
    startsAt: '2026-12-31T22:50:00Z',
    endsAt: '2026-12-31T23:50:00Z',
    label: 'Séance yoga adultes du jeudi 31 décembre 2026 de 23h50 à 00h50',
  },
  {
    type: 'enfant',
    startsAt: '2026-03-29T00:30:00Z',
    endsAt: '2026-03-29T00:45:00Z',
    label: 'Séance yoga enfants du dimanche 29 mars 2026 de 01h30 à 01h45',
  },
  {
    type: 'adulte',
    startsAt: '2026-10-25T00:15:00Z',
    endsAt: '2026-10-25T00:45:00Z',
    label: 'Séance yoga adultes du dimanche 25 octobre 2026 de 02h15 à 02h45',
  },
  {
    type: 'adulte',
    startsAt: '2028-02-29T10:00:00Z',
    endsAt: '2028-02-29T11:30:00Z',
    label: 'Séance yoga adultes du mardi 29 février 2028 de 11h00 à 12h30',
  },
];

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseLabelSql', () => {
  const ids: number[] = [];

  beforeAll(async () => {
    await db.delete(coursesTable).where(eq(coursesTable.internalNotes, MARKER));
  });

  afterAll(async () => {
    if (ids.length > 0) {
      await db.delete(coursesTable).where(inArray(coursesTable.id, ids));
    }
    await db.$client.end();
  });

  const insertCourse = async (
    tx: DbTransaction,
    type: CourseType,
    startsAt: Date,
    endsAt: Date,
  ): Promise<number> => {
    const inserted = await tx
      .insert(coursesTable)
      .values({ type, startsAt, endsAt, capacity: 10, visibility: 'public', internalNotes: MARKER })
      .returning({ id: coursesTable.id });
    const id = inserted[0]?.id ?? 0;
    ids.push(id);
    return id;
  };

  it('reconstructs the French label in SQL, including DST and year boundaries', async () => {
    await withTransaction(async (tx) => {
      for (const labelCase of CASES) {
        const id = await insertCourse(
          tx,
          labelCase.type,
          new Date(labelCase.startsAt),
          new Date(labelCase.endsAt),
        );

        const [row] = await tx
          .select({ label: courseLabelSql })
          .from(coursesTable)
          .where(eq(coursesTable.id, id));

        expect(row?.label).toBe(labelCase.label);
      }
    });
  });

  it('matches the TypeScript course label over a year of dates', async () => {
    await withTransaction(async (tx) => {
      for (let i = 0; i < 40; i++) {
        const startsAt = new Date(Date.UTC(2026, 0, 1, 9, 45) + i * 11 * 24 * 3600 * 1000);
        const endsAt = new Date(startsAt.getTime() + 75 * 60 * 1000);
        const type: CourseType = i % 2 === 0 ? 'adulte' : 'enfant';
        const id = await insertCourse(tx, type, startsAt, endsAt);

        const [row] = await tx
          .select({ label: courseLabelSql })
          .from(coursesTable)
          .where(eq(coursesTable.id, id));

        expect(row?.label).toBe(courseLabel({ type, startsAt, endsAt }));
      }
    });
  });

  it('filters the course list on the reconstructed label', async () => {
    await withTransaction(async (tx) => {
      await insertCourse(
        tx,
        'adulte',
        new Date('2026-11-12T09:45:00Z'),
        new Date('2026-11-12T11:00:00Z'),
      );

      const result = await courseService.list(
        {
          page: 0,
          pageSize: 50,
          sort: [{ field: 'startsAt', sort: 'asc' }],
          search: '12 novembre 2026',
        },
        tx,
      );

      expect(result.rows.map((row) => row.startsAt)).toContainEqual(
        new Date('2026-11-12T09:45:00Z'),
      );
    });
  });
});
