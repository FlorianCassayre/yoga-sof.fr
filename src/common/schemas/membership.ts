import { z } from 'zod';
import { CourseType, MembershipType } from '@prisma/client';

export const membershipFindSchema = z.object({
  id: z.number().int().min(0),
});

export const membershipCreateSchema = z.object({
  membershipModelId: z.nativeEnum(MembershipType),
  dateStart: z.date(),
  users: z.array(z.number().int().min(0)).min(1),
}).superRefine(({ membershipModelId, users }, ctx) => {
  if (membershipModelId === MembershipType.PERSON && users.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['users'],
      message: 'Une adhésion individuelle ne peut pas contenir plusieurs personnes',
    });
  }
});
