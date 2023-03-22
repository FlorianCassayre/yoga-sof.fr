import { z } from 'zod';
import { MembershipType, TransactionType } from '@prisma/client';

const checkUniqueFor = <T>(idGetter: (e: T) => number, message: string = `Les éléments doivent être distincts`) =>
  [
    (array: T[]) => new Set(array.map(e => idGetter(e))).size === array.length,
    { message }
  ] as const;

const checkUniqueIds = checkUniqueFor((id: number) => id);
const checkUniqueRefIds = checkUniqueFor(({ id }: { id: number }) => id);

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
    })).min(1).refine(...checkUniqueRefIds).optional(),
    newMemberships: z.array(z.strictObject({
      membershipModelId: z.nativeEnum(MembershipType),
      year: z.number().int().min(2021).max(2100),
    })).optional(),
    existingMembershipIds: z.array(
      z.number().int().min(0)
    ).min(1).refine(...checkUniqueIds).optional(),
  }),
  billing: z.strictObject({
    newCoupons: z.array(z.strictObject({
      newCouponIndex: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1).refine(...checkUniqueIds),
    })).min(1).refine(...checkUniqueFor((e: { newCouponIndex: number }) => e.newCouponIndex)).optional(),
    existingCoupons: z.array(z.strictObject({
      couponId: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1).refine(...checkUniqueIds),
    })).min(1).refine(...checkUniqueFor((e: { couponId: number }) => e.couponId)).optional(),
    trialCourseRegistrationId: z.number().int().min(0).optional(),
    replacementCourseRegistrations: z.array(z.strictObject({
      fromCourseRegistrationId: z.number().int().min(0),
      toCourseRegistrationId: z.number().int().min(0),
    }))
      .refine(...checkUniqueFor((e: { fromCourseRegistrationId: number }) => e.fromCourseRegistrationId))
      .refine(...checkUniqueFor((e: { toCourseRegistrationId: number }) => e.toCourseRegistrationId))
      .optional(),
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
