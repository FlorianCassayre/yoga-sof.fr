import { describe, expect, it } from 'vitest';

import {
  registrationCreateSchema,
  registrationListSchema,
} from '../../../features/registration/registrationSchemas';

describe('registrationListSchema', () => {
  it('accepts pagination and known sort fields', () => {
    expect(
      registrationListSchema.parse({
        page: 0,
        pageSize: 10,
        sort: [{ field: 'createdAt', sort: 'desc' }],
      }),
    ).toMatchObject({ page: 0, pageSize: 10 });
  });

  it('rejects unknown sort fields', () => {
    expect(
      registrationListSchema.safeParse({
        page: 0,
        pageSize: 10,
        sort: [{ field: 'canceled', sort: 'asc' }],
      }).success,
    ).toBe(false);
  });

  it('requires a sort', () => {
    expect(registrationListSchema.safeParse({ page: 0, pageSize: 10 }).success).toBe(false);
    expect(registrationListSchema.safeParse({ page: 0, pageSize: 10, sort: [] }).success).toBe(
      false,
    );
  });
});

describe('registrationCreateSchema', () => {
  const base = { users: [{ id: 'user-1' }], notify: false };

  it('transforms courses and users into id lists', () => {
    const result = registrationCreateSchema.parse({
      ...base,
      courses: [{ id: 3 }, { id: 7 }],
    });

    expect(result).toEqual({
      courseIds: [3, 7],
      bundleIds: [],
      userIds: ['user-1'],
      notify: false,
    });
  });

  it('transforms bundles into id lists', () => {
    const result = registrationCreateSchema.parse({ ...base, bundles: [{ id: 4 }] });

    expect(result).toEqual({ courseIds: [], bundleIds: [4], userIds: ['user-1'], notify: false });
  });

  it('rejects empty and mixed targets', () => {
    expect(registrationCreateSchema.safeParse(base).success).toBe(false);
    expect(
      registrationCreateSchema.safeParse({ ...base, courses: [{ id: 1 }], bundles: [{ id: 2 }] })
        .success,
    ).toBe(false);
  });

  it('requires at least one user', () => {
    expect(
      registrationCreateSchema.safeParse({ courses: [{ id: 1 }], users: [], notify: false })
        .success,
    ).toBe(false);
  });
});
