import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { courseService } from '../../../features/course/courseService';
import { coursesTable } from '../../../features/course/coursesTable';

const values = {
  type: 'adulte',
  startsAt: new Date('2030-03-04T09:07:00.000Z'),
  endsAt: new Date('2030-03-04T11:07:00.000Z'),
  capacity: 12,
  visibility: 'public',
  internalNotes: 'note',
} as const satisfies typeof coursesTable.$inferInsert;

const insertCourse = async (values: typeof coursesTable.$inferInsert) => {
  const [row] = await db.insert(coursesTable).values(values).returning();
  if (!row) {
    throw new Error('expected course to be created');
  }

  return row;
};

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseService', () => {
  const ids: number[] = [];

  afterAll(async () => {
    await Promise.all(ids.map((id) => db.delete(coursesTable).where(eq(coursesTable.id, id))));
    await db.$client.end();
  });

  it('suggests templates from the three most recent non-empty weeks', async () => {
    const latest = await insertCourse({
      ...values,
      startsAt: new Date('2031-01-29T13:00:00.000Z'),
      endsAt: new Date('2031-01-29T15:00:00.000Z'),
      type: 'enfant',
      capacity: 12,
    });
    ids.push(latest.id);
    const duplicateTarget = await insertCourse({
      ...values,
      startsAt: new Date('2031-01-13T08:00:00.000Z'),
      endsAt: new Date('2031-01-13T10:00:00.000Z'),
      capacity: 8,
    });
    ids.push(duplicateTarget.id);
    const other = await insertCourse({
      ...values,
      startsAt: new Date('2031-01-14T09:00:00.000Z'),
      endsAt: new Date('2031-01-14T11:00:00.000Z'),
      type: 'enfant',
      capacity: 12,
    });
    ids.push(other.id);
    const oldest = await insertCourse({
      ...values,
      startsAt: new Date('2031-01-06T08:00:00.000Z'),
      endsAt: new Date('2031-01-06T10:00:00.000Z'),
      capacity: 12,
    });
    ids.push(oldest.id);
    const ignored = await insertCourse({
      ...values,
      startsAt: new Date('2031-01-02T02:15:00.000Z'),
      endsAt: new Date('2031-01-02T03:15:00.000Z'),
      type: 'enfant',
      capacity: 12,
    });
    ids.push(ignored.id);

    const templates = await withTransaction((tx) => courseService.suggestTemplates(tx), {
      readOnly: true,
    });

    expect(templates).toEqual(
      expect.arrayContaining([
        { weekday: 3, type: 'enfant', startTime: '14:00', endTime: '16:00', capacity: 12 },
        { weekday: 2, type: 'enfant', startTime: '10:00', endTime: '12:00', capacity: 12 },
        { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 12 },
      ]),
    );
    expect(
      templates.filter(
        (template) =>
          template.weekday === 1 &&
          template.type === 'adulte' &&
          template.startTime === '09:00' &&
          template.endTime === '11:00',
      ),
    ).toHaveLength(1);
    expect(
      templates.filter((template) => template.weekday === 4 && template.startTime === '03:15'),
    ).toHaveLength(0);
  });

  it('creates a batch and gets a course', async () => {
    const rows = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
          ],
          weeks: ['2030-03-04'],
        },
        tx,
      ),
    );
    rows.forEach((row) => ids.push(row.id));
    expect(rows).toHaveLength(1);

    const fetched = await withTransaction((tx) => courseService.get({ id: rows[0]!.id }, tx));
    expect(fetched).toMatchObject({
      type: 'adulte',
      startsAt: new Date('2030-03-04T08:00:00.000Z'),
      endsAt: new Date('2030-03-04T10:00:00.000Z'),
      capacity: 10,
      visibility: 'public',
      internalNotes: '',
      version: 1,
    });
  });

  it('rejects a batch ending in the past', async () => {
    await expect(
      withTransaction((tx) =>
        courseService.createBatch(
          {
            visibility: 'public',
            templates: [
              { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            ],
            weeks: ['2025-01-06'],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('La séance doit se terminer dans le futur.');
  });

  it('rejects overlapping courses on update but allows consecutive ones', async () => {
    const rows = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            { weekday: 1, type: 'adulte', startTime: '14:00', endTime: '16:00', capacity: 10 },
          ],
          weeks: ['2030-04-01'],
        },
        tx,
      ),
    );
    rows.forEach((row) => ids.push(row.id));
    const [first, second] = rows;

    await expect(
      withTransaction((tx) =>
        courseService.update(
          {
            ...values,
            id: first!.id,
            version: first!.version,
            startsAt: new Date('2030-04-01T13:00:00.000Z'),
            endsAt: new Date('2030-04-01T15:00:00.000Z'),
          },
          tx,
        ),
      ),
    ).rejects.toThrow('chevauche une autre séance.');

    const moved = await withTransaction((tx) =>
      courseService.update(
        {
          ...values,
          id: first!.id,
          version: first!.version,
          startsAt: new Date('2030-04-01T14:00:00.000Z'),
          endsAt: new Date('2030-04-01T16:00:00.000Z'),
        },
        tx,
      ),
    );
    expect(moved.version).toBe(first!.version + 1);
    expect(second).toBeDefined();
  });

  it('creates a batch of courses', async () => {
    const rows = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            { weekday: 3, type: 'enfant', startTime: '14:00', endTime: '16:00', capacity: 8 },
          ],
          weeks: ['2032-03-01', '2032-03-08'],
        },
        tx,
      ),
    );
    rows.forEach((row) => ids.push(row.id));

    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.startsAt.toISOString())).toEqual([
      '2032-03-01T08:00:00.000Z',
      '2032-03-03T13:00:00.000Z',
      '2032-03-08T08:00:00.000Z',
      '2032-03-10T13:00:00.000Z',
    ]);
    expect(rows.every((row) => row.registeredCount === 0 && row.version === 1)).toBe(true);
  });

  it('rejects an empty batch', async () => {
    await expect(
      withTransaction((tx) =>
        courseService.createBatch(
          {
            visibility: 'public',
            templates: [],
            weeks: ['2032-03-01'],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('Ajoutez au moins un créneau hebdomadaire.');
    await expect(
      withTransaction((tx) =>
        courseService.createBatch(
          {
            visibility: 'public',
            templates: [
              { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            ],
            weeks: [],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('Sélectionnez au moins une semaine.');
  });

  it('rejects overlapping templates inside a batch but allows consecutive ones', async () => {
    await expect(
      withTransaction((tx) =>
        courseService.createBatch(
          {
            visibility: 'public',
            templates: [
              { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
              { weekday: 1, type: 'adulte', startTime: '10:00', endTime: '12:00', capacity: 10 },
            ],
            weeks: ['2032-03-15'],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('chevauche une autre séance.');

    const rows = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            { weekday: 1, type: 'adulte', startTime: '11:00', endTime: '13:00', capacity: 10 },
          ],
          weeks: ['2032-03-15'],
        },
        tx,
      ),
    );
    rows.forEach((row) => ids.push(row.id));

    expect(rows).toHaveLength(2);
  });

  it('rejects a batch overlapping an existing course', async () => {
    const existing = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
          ],
          weeks: ['2032-03-22'],
        },
        tx,
      ),
    );
    existing.forEach((row) => ids.push(row.id));

    await expect(
      withTransaction((tx) =>
        courseService.createBatch(
          {
            visibility: 'public',
            templates: [
              { weekday: 1, type: 'adulte', startTime: '10:00', endTime: '12:00', capacity: 10 },
            ],
            weeks: ['2032-03-22'],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('chevauche une autre séance.');
  });

  it('rejects writes in a read-only transaction', async () => {
    try {
      await withTransaction(
        async (tx) => {
          await tx.insert(coursesTable).values(values);
        },
        { readOnly: true },
      );
      expect.unreachable('expected the write to fail');
    } catch (error) {
      expect((error as { cause?: { message?: string } }).cause?.message).toMatch(/read-only/i);
    }
  });

  it('rolls back a failed transaction', async () => {
    let rolledBackId = 0;

    await expect(
      withTransaction(async (tx) => {
        const rows = await courseService.createBatch(
          {
            visibility: 'public',
            templates: [
              { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
            ],
            weeks: ['2030-03-18'],
          },
          tx,
        );
        rolledBackId = rows[0]!.id;

        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    await expect(
      withTransaction((tx) => courseService.get({ id: rolledBackId }, tx)),
    ).rejects.toThrow(ServiceError);
  });

  it('updates only on the current version', async () => {
    const rows = await withTransaction((tx) =>
      courseService.createBatch(
        {
          visibility: 'public',
          templates: [
            { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: 10 },
          ],
          weeks: ['2030-03-25'],
        },
        tx,
      ),
    );
    rows.forEach((row) => ids.push(row.id));
    const created = rows[0]!;

    const updated = await withTransaction((tx) =>
      courseService.update(
        {
          ...values,
          id: created.id,
          version: created.version,
          startsAt: created.startsAt,
          endsAt: created.endsAt,
        },
        tx,
      ),
    );
    expect(updated?.version).toBe(created.version + 1);

    await expect(
      withTransaction((tx) =>
        courseService.update(
          {
            ...values,
            id: created.id,
            version: created.version,
            startsAt: created.startsAt,
            endsAt: created.endsAt,
          },
          tx,
        ),
      ),
    ).rejects.toThrow(ServiceError);
  });

  it('throws on an unknown course', async () => {
    await expect(withTransaction((tx) => courseService.get({ id: -100 }, tx))).rejects.toThrow(
      ServiceError,
    );
    await expect(withTransaction((tx) => courseService.get({ id: -100 }, tx))).rejects.toThrow(
      'La séance est introuvable',
    );
  });

  it('lists courses with pagination', async () => {
    const result = await withTransaction((tx) =>
      courseService.list({ page: 0, pageSize: 5, sort: [{ field: 'startsAt', sort: 'asc' }] }, tx),
    );

    expect(result.rows.length).toBeLessThanOrEqual(5);
    expect(result.total).toBeGreaterThanOrEqual(result.rows.length);
  });

  it('keeps only future courses when upcoming is set', async () => {
    const past = await insertCourse({
      ...values,
      startsAt: new Date('2025-01-10T09:00:00.000Z'),
      endsAt: new Date('2025-01-10T11:00:00.000Z'),
    });
    ids.push(past.id);
    const future = await insertCourse({
      ...values,
      startsAt: new Date('2027-01-10T09:00:00.000Z'),
      endsAt: new Date('2027-01-10T11:00:00.000Z'),
    });
    ids.push(future.id);

    const result = await withTransaction((tx) =>
      courseService.list(
        {
          page: 0,
          pageSize: 50,
          sort: [{ field: 'startsAt', sort: 'asc' }],
          upcoming: true,
        },
        tx,
      ),
    );
    const upcomingIds = result.rows.map((row) => row.id);

    expect(upcomingIds).toContain(future.id);
    expect(upcomingIds).not.toContain(past.id);
  });

  it('lists only the courses overlapping the calendar range, ordered by start', async () => {
    const inside = await insertCourse({
      ...values,
      startsAt: new Date('2026-01-15T09:00:00.000Z'),
      endsAt: new Date('2026-01-15T11:00:00.000Z'),
    });
    ids.push(inside.id);
    const before = await insertCourse({
      ...values,
      startsAt: new Date('2026-01-10T09:00:00.000Z'),
      endsAt: new Date('2026-01-10T11:00:00.000Z'),
    });
    ids.push(before.id);
    const after = await insertCourse({
      ...values,
      startsAt: new Date('2026-01-25T09:00:00.000Z'),
      endsAt: new Date('2026-01-25T11:00:00.000Z'),
    });
    ids.push(after.id);

    const result = await withTransaction((tx) =>
      courseService.listCalendar(
        {
          start: new Date('2026-01-12T09:00:00.000Z'),
          end: new Date('2026-01-20T09:00:00.000Z'),
        },
        tx,
      ),
    );
    const inRange = result.filter((row) => [inside.id, before.id, after.id].includes(row.id));

    expect(inRange.map((row) => row.id)).toEqual([inside.id]);
  });
});
