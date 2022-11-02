import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { userCreateSchema, userUpdateSchema } from '../../common/newSchemas/user';
import { z } from 'zod';

export const findUser = async (args: { where: Prisma.UserWhereUniqueInput, select?: Prisma.UserSelect, include?: Prisma.UserInclude }) =>
  prisma.user.findUniqueOrThrow(args);

export const findUsers = async (args: { where?: Prisma.UserWhereInput, select?: Prisma.UserSelect, include?: Prisma.UserInclude, orderBy?: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput> } = {}) =>
  prisma.user.findMany(args);

export const findUserUpdate = async (args: { where: Prisma.UserWhereUniqueInput }) => {
  const { id, name, email, customName, customEmail } = await findUser({ where: args.where, select: { id: true, name: true, email: true, customName: true, customEmail: true } });
  return { id, name: customName ?? name, email: customEmail ?? email };
}

export const createUser = async (args: { data: z.infer<typeof userCreateSchema>, select?: Prisma.UserSelect }) => {
  userCreateSchema.parse(args.data);
  return prisma.user.create(args);
}

export const updateUser = async (args: { where: Prisma.UserWhereUniqueInput, data: z.infer<typeof userCreateSchema>, select?: Prisma.UserSelect }) => {
  userUpdateSchema.parse({ ...args.data, id: args.where.id });
  return await prisma.$transaction(async () => {
    const user = await findUserUpdate({ where: args.where });
    const customName = args.data.name === user.name ? null : args.data.name;
    const customEmail = args.data.email === user.email ? null : args.data.email;
    return await prisma.user.update({ ...args, data: { customName, customEmail } });
  });
}
