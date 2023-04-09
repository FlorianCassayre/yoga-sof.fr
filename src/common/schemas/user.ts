import { z } from 'zod';

// Shared with the frontsite, beware
export const userSchemaBase = z.object({
  name: z.string().min(1),
  email: z.union([z.literal(''), z.string().email()]).nullable(),
});

const userSchemaAdminBase = userSchemaBase.merge(z.object({
  managedByUserId: z.number().int().min(0).nullable(),
}));

export const userFindSchema = z.object({
  id: z.number().int().min(0),
});

export const userUpdateSchema = userSchemaAdminBase.merge(userFindSchema);

export const userCreateSchema = userSchemaAdminBase;

export const userFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});

export const userDisableSchema = z.object({
  disabled: z.boolean(),
}).merge(userFindSchema);

export const userUpdateSelfSchema = userSchemaBase.merge(userFindSchema);

export const usersMergeSchema = z.strictObject({
  users: z.array(z.strictObject({
    user: z.object({ id: z.number().int().min(0) }),
  })).length(2),
}).refine(({ users: [u1, u2] }) => u1.user.id === u2.user.id, { message: `Les deux utilisateurs doivent être différents` });
