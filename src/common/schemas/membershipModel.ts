import { z } from 'zod';
import { MembershipType } from '@prisma/client';

export const membershipModelFindSchema = z.object({ id: z.nativeEnum(MembershipType) });

const membershipModelSchemaBase = z.object({
  price: z.number().int().min(0).max(99),
}).merge(membershipModelFindSchema);

export const membershipModelUpdateSchema = membershipModelSchemaBase;

export const membershipModelCreateSchema = membershipModelSchemaBase;

export const membershipModelGetTransformSchema = z.object({
  id: z.preprocess(
    (a) => z.string().parse(a),
    z.nativeEnum(MembershipType)
  ),
});
