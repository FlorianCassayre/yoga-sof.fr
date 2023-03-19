import { z } from 'zod';
import { MembershipType } from '@prisma/client';

export const orderCreateSchema = z.object({
  userId: z.number().int().min(0),
  purchases: z.object({
    courseRegistrations: z.array(z.object({
      id: z.number().int().min(0),
    })),
    newCoupons: z.array(z.object({
      couponModel: z.object({
        id: z.number().int().min(0),
      }),
    })),
    existingCoupons: z.array(z.object({
      id: z.number().int().min(0),
    })),
    newMemberships: z.array(z.object({
      membershipId: z.number().int().min(0),
    })),
    existingMemberships: z.array(z.object({
      id: z.number().int().min(0),
    })),
  }),
  billing: z.object({

    transactionId: z.number().int().min(0),
  }),
  notes: z.string(),

})/*.superRefine(({ membershipModelId, users }, ctx) => {
  if (membershipModelId === MembershipType.PERSON && users.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['users'],
      message: 'Une adhésion individuelle ne peut pas contenir plusieurs personnes',
    });
  }
});*/
