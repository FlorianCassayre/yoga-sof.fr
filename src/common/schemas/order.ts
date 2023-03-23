import { z } from 'zod';
import { MembershipType, TransactionType } from '@prisma/client';

export const orderFindSchema = z.object({
  id: z.number().int().min(0),
});

export const orderFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});

const checkUniqueFor = <T>(idGetter: (e: T) => number, message: string = `Les éléments doivent être distincts`) =>
  [
    (array: T[]) => new Set(array.map(e => idGetter(e))).size === array.length,
    { message }
  ] as const;

export const orderCreateSchema = z.strictObject({
  user: z.object({
    id: z.number().int().min(0),
  }),
  purchases: z.strictObject({
    courseRegistrations: z.array(z.object({
      id: z.number().int().min(0),
    })).min(1).optional(),
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
    existingMembershipIds: z.array(
      z.number().int().min(0)
    ).min(1).optional(),
  }),
  billing: z.strictObject({
    newCoupons: z.array(z.strictObject({
      newCouponIndex: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).optional(),
    existingCoupons: z.array(z.strictObject({
      couponId: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).optional(),
    trialCourseRegistrationId: z.number().int().min(0).optional(),
    replacementCourseRegistrations: z.array(z.strictObject({
      fromCourseRegistrationId: z.number().int().min(0),
      toCourseRegistrationId: z.number().int().min(0),
    }))
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
  type FieldPath = (string | number)[];
  const distinctPaths = (paths: FieldPath[]): FieldPath[] =>
    Object.values(Object.fromEntries(paths.map(path => [path.join('.'), path])));

  type IdRef = { id: number, path: FieldPath };
  const subsetChecksData: [IdRef[], IdRef[]][] = [
    // purchases.courseRegistrations -> [billing.newCoupons.courseRegistrationIds, billing.existingCoupons.courseRegistrationIds, billing.trialCourseRegistrationId, billing.replacementCourseRegistrations.toCourseRegistrationId]
    [
      data.purchases.courseRegistrations?.map(({ id }) => ({ id, path: ['purchases', 'courseRegistrations'] })) ?? [],
      [
        ...(data.billing.newCoupons?.flatMap(({ courseRegistrationIds }, index) => courseRegistrationIds.map(id => ({ id, path: ['billing', 'newCoupons', index, 'courseRegistrationIds'] }))) ?? []),
        ...(data.billing.existingCoupons?.flatMap(({ courseRegistrationIds }, index) => courseRegistrationIds.map(id => ({ id, path: ['billing', 'existingCoupons', index, 'courseRegistrationIds'] }))) ?? []),
        ...[data.billing.trialCourseRegistrationId].filter((v): v is number => v !== undefined).map(id => ({ id, path: ['billing', 'trialCourseRegistrationId'] })),
        ...(data.billing.replacementCourseRegistrations?.map(({ toCourseRegistrationId }, index) => ({ id: toCourseRegistrationId, path: ['billing', 'replacementCourseRegistrations', index, 'toCourseRegistrationId'] })) ?? [])
      ]
    ],
    // purchases.newCoupons -> [billing.newCoupons.newCouponIndex]
    [
      data.purchases.newCoupons?.map((_, index) => ({ id: index, path: ['purchases', 'newCoupons', index, 'couponModel'] })) ?? [], // <- The error is not exactly this field but fine
      data.billing.newCoupons?.map(({ newCouponIndex }, index) => ({ id: newCouponIndex, path: ['billing', 'newCoupons', index, 'newCouponIndex'] })) ?? []
    ],
  ];

  subsetChecksData.forEach(([superset, subsets]) => {
    // Check for duplicate values
    const counts: Record<number, FieldPath[]> = {};
    [superset, subsets.flat()].forEach(expectedDistinct => {
      expectedDistinct.forEach(({ id, path }) => {
        if (counts[id] === undefined) {
          counts[id] = [];
        }
        counts[id].push(path);
      });
    });
    Object.values(counts).filter((array) => array.length > 1).forEach((array) => {
      distinctPaths(array).forEach(path => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Les éléments doivent être distincts',
        });
      });
    });
    // Check for subset
    const supersetIds = new Set(superset.map(({ id }) => id));
    subsets.flat().forEach(({ id, path }) => {
      if (!supersetIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: `L'élément ne fait pas partie des éléments sélectionnés`,
        });
      }
    });
  });

  // Additional checks

  const courseRegistrationIds = new Set(data.purchases.courseRegistrations?.map(({ id }) => id) ?? []);

  data.billing.replacementCourseRegistrations?.forEach(({ fromCourseRegistrationId }, index) => {
    if (courseRegistrationIds.has(fromCourseRegistrationId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billing', 'replacementCourseRegistrations', index, 'fromCourseRegistrationId'],
        message: `Une des séances fait déjà partie de l'achat`,
      });
    }
  });

  if (!(
    data.purchases.courseRegistrations?.length
    || data.purchases.newCoupons?.length
    || data.purchases.existingCoupons?.length
    || data.purchases.newMemberships?.length
    || data.purchases.existingMembershipIds?.length
  )) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ctx.path,
      message: `La commande ne peut pas être vide`,
    });
  }

  if (data.billing.transactionId !== undefined && data.billing.newPayment !== undefined) {
    [['data', 'billing', 'transactionId'], ['billing', 'newPayment']].forEach(path =>
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ctx.path,
        message: `Il ne peut y avoir qu'un seul paiement par commande`,
      })
    );
  }

});
