import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import type { courseCreateSchema } from '../../../features/course/courseSchemas';
import { courseService } from '../../../features/course/courseService';
import { coursesTable } from '../../../features/course/coursesTable';

const values = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  capacity: 12,
  visibility: 'public',
  internalNotes: 'note',
} as const satisfies z.infer<typeof courseCreateSchema>;

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseService', () => {
  const ids: number[] = [];

  afterAll(async () => {
    await Promise.all(ids.map((id) => db.delete(coursesTable).where(eq(coursesTable.id, id))));
    await db.$client.end();
  });

  it('creates and gets a course', async () => {
    const created = await withTransaction((tx) => courseService.create(values, tx));
    ids.push(created.id);

    const fetched = await withTransaction((tx) => courseService.get({ id: created.id }, tx));
    expect(fetched).toMatchObject({ ...values, version: 1 });
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
        const created = await courseService.create(values, tx);
        rolledBackId = created.id;

        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    await expect(
      withTransaction((tx) => courseService.get({ id: rolledBackId }, tx)),
    ).rejects.toThrow(ServiceError);
  });

  it('updates only on the current version', async () => {
    const created = await withTransaction((tx) => courseService.create(values, tx));
    ids.push(created.id);

    const updated = await withTransaction((tx) =>
      courseService.update({ ...values, id: created.id, version: created.version }, tx),
    );
    expect(updated?.version).toBe(created.version + 1);

    await expect(
      withTransaction((tx) =>
        courseService.update({ ...values, id: created.id, version: created.version }, tx),
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
    const past = await withTransaction((tx) =>
      courseService.create(
        {
          ...values,
          startsAt: new Date('2025-01-10T09:00:00.000Z'),
          endsAt: new Date('2025-01-10T11:00:00.000Z'),
        },
        tx,
      ),
    );
    ids.push(past.id);
    const future = await withTransaction((tx) =>
      courseService.create(
        {
          ...values,
          startsAt: new Date('2027-01-10T09:00:00.000Z'),
          endsAt: new Date('2027-01-10T11:00:00.000Z'),
        },
        tx,
      ),
    );
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
});
