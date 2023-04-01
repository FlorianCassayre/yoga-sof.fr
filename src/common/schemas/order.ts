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

export const orderCreateStep1UserSchema = z.object({
  user: z.object({
    id: z.number().int().min(0),
  }),
  billing: z.object({
    transaction: z.object({
      id: z.number().int().min(0),
    }).optional(),
  }),
});

const orderCreateStep2PurchasesSchemaBase = orderCreateStep1UserSchema.merge(z.object({
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
      membershipModel: z.object({
        id: z.nativeEnum(MembershipType),
      }),
      year: z.number().int().min(2021).max(2100),
    })).optional(),
    existingMemberships: z.array(
      z.object({
        id: z.number().int().min(0),
      }),
    ).min(1).optional(),
  }),
}));

export const refineAtLeastOnePurchase: z.RefinementEffect<z.infer<typeof orderCreateStep2PurchasesSchemaBase>>['refinement'] = ({ purchases }, ctx) => {
  if (!(
    purchases.courseRegistrations?.length
    || purchases.newCoupons?.length
    || purchases.existingCoupons?.length
    || purchases.newMemberships?.length
    || purchases.existingMemberships?.length
  )) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ctx.path,
      message: `La commande ne peut pas être vide`,
    });
  }
};

export const orderCreateStep2PurchasesSchema = orderCreateStep2PurchasesSchemaBase.superRefine(refineAtLeastOnePurchase);

const orderCreateStep3DiscountsBase = orderCreateStep2PurchasesSchemaBase.merge(z.object({
  billing: orderCreateStep2PurchasesSchemaBase.shape.billing.merge(z.object({
    newCoupons: z.array(z.strictObject({
      newCouponIndex: z.number().int().min(0),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).optional(),
    existingCoupons: z.array(z.strictObject({
      coupon: z.object({
        id: z.number().int().min(0),
      }),
      courseRegistrationIds: z.array(z.number().int().min(0)).min(1),
    })).optional(),
    trialCourseRegistration: z.strictObject({
      courseRegistrationId: z.number().int().min(0),
      newPrice: z.number().int().min(0),
    }).optional(),
    replacementCourseRegistrations: z.array(z.strictObject({
      fromCourseRegistrationId: z.number().int().min(0),
      toCourseRegistrationId: z.number().int().min(0),
    })).optional(),
  })),
}));

export const refineBilling: z.RefinementEffect<z.infer<typeof orderCreateStep3DiscountsBase>>['refinement'] = (data, ctx) => {
  type FieldPath = (string | number)[];
  const distinctPaths = (paths: FieldPath[]): FieldPath[] =>
    Object.values(Object.fromEntries(paths.map(path => [path.join('.'), path])));

  type IdRef = { id: number, path: FieldPath };
  const subsetChecksData: [IdRef[], IdRef[]][] = [
    // purchases.courseRegistrations -> [billing.newCoupons.courseRegistrationIds, billing.existingCoupons.courseRegistrationIds, billing.trialCourseRegistration.courseRegistrationId, billing.replacementCourseRegistrations.toCourseRegistrationId]
    [
      data.purchases.courseRegistrations?.map(({ id }) => ({ id, path: ['purchases', 'courseRegistrations'] })) ?? [],
      [
        ...(data.billing.newCoupons?.flatMap(({ courseRegistrationIds }, index) => courseRegistrationIds.map(id => ({ id, path: ['billing', 'newCoupons', index, 'courseRegistrationIds'] }))) ?? []),
        ...(data.billing.existingCoupons?.flatMap(({ courseRegistrationIds }, index) => courseRegistrationIds.map(id => ({ id, path: ['billing', 'existingCoupons', index, 'courseRegistrationIds'] }))) ?? []),
        ...[data.billing.trialCourseRegistration?.courseRegistrationId].filter((v): v is number => v !== undefined).map(id => ({ id, path: ['billing', 'trialCourseRegistration', 'courseRegistrationId'] })),
        ...(data.billing.replacementCourseRegistrations?.map(({ toCourseRegistrationId }, index) => ({ id: toCourseRegistrationId, path: ['billing', 'replacementCourseRegistrations', index, 'toCourseRegistrationId'] })) ?? [])
      ]
    ],
    // purchases.newCoupons -> [billing.newCoupons.newCouponIndex]
    [
      data.purchases.newCoupons?.map((_, index) => ({ id: index, path: ['purchases', 'newCoupons', index, 'couponModel'] })) ?? [], // <- The error is not exactly this field but fine
      data.billing.newCoupons?.map(({ newCouponIndex }, index) => ({ id: newCouponIndex, path: ['billing', 'newCoupons', index, 'newCouponIndex'] })) ?? []
    ],
    [
      data.billing.existingCoupons?.map(({ coupon }, index) => ({ id: coupon.id, path: ['billing', 'existingCoupons', index, 'coupon'] })) ?? [],
      [],
    ],
    [
      data.billing.replacementCourseRegistrations?.map((r, index) => ({ id: r.fromCourseRegistrationId, path: ['billing', 'replacementCourseRegistrations', index, 'fromCourseRegistrationId'] })) ?? [],
      [],
    ],
  ];

  subsetChecksData.forEach(([superset, subsets]) => {
    // Check for duplicate values
    [superset, subsets.flat()].forEach(expectedDistinct => {
      const counts: Record<number, FieldPath[]> = {};
      expectedDistinct.forEach(({ id, path }) => {
        if (counts[id] === undefined) {
          counts[id] = [];
        }
        counts[id].push(path);
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
};

export const orderCreateStep3Discounts = orderCreateStep3DiscountsBase.superRefine(refineAtLeastOnePurchase).superRefine(refineBilling);

const orderCreateStep4PaymentBase = orderCreateStep3DiscountsBase.merge(z.object({
  billing: orderCreateStep3DiscountsBase.shape.billing.merge(z.strictObject({ // <- needs to be strict
    newPayment: z.strictObject({
      amount: z.number().int().min(1),
      type: z.nativeEnum(TransactionType),
      date: z.date(),
    }).optional(),
    force: z.boolean().refine(value => value, { message: 'Vous devez cocher cette case pour continuer' }),
  })),
  notes: z.string().optional(),
}));

export const refinePaymentType: z.RefinementEffect<z.infer<typeof orderCreateStep4PaymentBase>>['refinement'] = (data, ctx) => {
  if (data.billing.transaction !== undefined && data.billing.newPayment !== undefined) {
    [['data', 'billing', 'transaction'], ['billing', 'newPayment']].forEach(path =>
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ctx.path,
        message: `Il ne peut y avoir qu'un seul paiement par commande`,
      })
    );
  }
};

export const orderCreateStep4Payment = orderCreateStep4PaymentBase.superRefine(refineAtLeastOnePurchase).superRefine(refineBilling).superRefine(refinePaymentType);

export const orderCreateSchema = orderCreateStep4PaymentBase.merge(z.strictObject({ // <- needs to be strict
  step: z.number().optional(),
})).superRefine(refineAtLeastOnePurchase).superRefine(refineBilling).superRefine(refinePaymentType);
