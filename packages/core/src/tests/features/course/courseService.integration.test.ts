import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { db } from '../../../db/db';
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
    const created = await courseService.create(values);
    if (!created) {
      throw new Error('expected course to be created');
    }
    ids.push(created.id);

    const fetched = await courseService.get({ id: created.id });
    expect(fetched).toMatchObject({ ...values, version: 1 });
  });

  it('updates only on the current version', async () => {
    const created = await courseService.create(values);
    if (!created) {
      throw new Error('expected course to be created');
    }
    ids.push(created.id);

    const updated = await courseService.update({
      ...values,
      id: created.id,
      version: created.version,
    });
    expect(updated?.version).toBe(created.version + 1);

    const stale = await courseService.update({
      ...values,
      id: created.id,
      version: created.version,
    });
    expect(stale).toBeNull();
  });

  it('lists courses with pagination', async () => {
    const result = await courseService.list({ page: 0, pageSize: 5 });

    expect(result.rows.length).toBeLessThanOrEqual(5);
    expect(result.total).toBeGreaterThanOrEqual(result.rows.length);
  });
});
