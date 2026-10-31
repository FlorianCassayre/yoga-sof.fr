import { describe, expect, it } from 'vitest';

import { courseUserRegistrationListSchema } from '../../../features/courseUserRegistration/courseUserRegistrationSchemas';

describe('courseUserRegistrationListSchema', () => {
  it('accepts pagination and known sort fields', () => {
    expect(
      courseUserRegistrationListSchema.parse({
        page: 0,
        pageSize: 10,
        sort: [{ field: 'createdAt', sort: 'desc' }],
      }),
    ).toMatchObject({ page: 0, pageSize: 10 });
  });

  it('rejects unknown sort fields', () => {
    expect(
      courseUserRegistrationListSchema.safeParse({
        page: 0,
        pageSize: 10,
        sort: [{ field: 'canceled', sort: 'asc' }],
      }).success,
    ).toBe(false);
  });

  it('requires a sort', () => {
    expect(courseUserRegistrationListSchema.safeParse({ page: 0, pageSize: 10 }).success).toBe(
      false,
    );
    expect(
      courseUserRegistrationListSchema.safeParse({ page: 0, pageSize: 10, sort: [] }).success,
    ).toBe(false);
  });
});
