import { z } from 'zod';
import { MembershipType, TransactionType } from '@prisma/client';

const checkUniqueIds = [(array: number[]) => new Set(array).size === array.length, { message: `Les éléments doivent être distincts` }] as const;
const checkUniqueRefIds = [(array: { id: number }[]) => new Set(array.map(({ id }) => id)).size === array.length, { message: `Les éléments doivent être distincts` }] as const;

export const orderCreateSchema = z.strictObject({
  user: z.object({
    id: z.number().int().min(0),
  }),
  purchases: z.strictObject({
    courseRegistrations: z.array(z.object({
      id: z.number().int().min(0),
    })).min(1).refine(...checkUniqueRefIds).optional(),
    newCoupons: z.array(z.strictObject({
      couponModel: z.object({
        id: z.number().int().min(0),
      }),
    })).optional(),
    existingCoupons: z.array(z.object({
      id: z.number().int().min(0),
    })).min(1).optional(),
    newMemberships: z.array(z.strictObject({
      membershipModelId: z.nativeEnum(MembershipType),
      year: z.number().int().min(2021).max(2100),
    })).optional(),
    existingMemberships: z.array(z.object({
      id: z.number().int().min(0),
    })).min(1).optional(),
  }),
  billing: z.strictObject({
    newCoupons: z.array(z.strictObject({
      newCouponIndex: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).min(1).optional(),
    existingCoupons: z.array(z.strictObject({
      couponId: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).min(1).optional(),
    trialCourseRegistrationId: z.number().int().min(0).optional(),
    replacementCourseRegistrations: z.array(z.strictObject({
      oldCourseRegistrationId: z.number().int().min(0),
      replacedByCourseRegistrationId: z.number().int().min(0),
    })).optional(),
    transactionId: z.number().int().min(0).optional(),
    newPayment: z.strictObject({
      amount: z.number().int().min(1),
      type: z.nativeEnum(TransactionType),
      date: z.date(),
    }).optional(),
    force: z.boolean().refine(value => value, { message: 'Vous devez cocher cette case pour continuer' }),
  }),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  const courseRegistrationIds = data.purchases.courseRegistrations?.map(({ id }) => id) ?? [];

});
/*.superRefine(({ membershipModelId, users }, ctx) => {
  if (membershipModelId === MembershipType.PERSON && users.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['users'],
      message: 'Une adhésion individuelle ne peut pas contenir plusieurs personnes',
    });
  }
});*/
