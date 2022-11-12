import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { userCreateSchema, userUpdateSchema } from '../../common/newSchemas/user';
import { z } from 'zod';

export const findUser = async <Where extends Prisma.UserWhereUniqueInput, Select extends Prisma.UserSelect, Include extends Prisma.UserInclude>(args: { where: Where, select?: Select, include?: Include }) =>
  prisma.user.findUniqueOrThrow(args);

export const findUsers = async <Where extends Prisma.UserWhereInput, Select extends Prisma.UserSelect, Include extends Prisma.UserInclude, OrderBy extends Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.user.findMany(args);

export const findUserUpdate = async <Where extends Prisma.UserWhereUniqueInput>(args: { where: Where }) => {
  const { id, name, email, customName, customEmail } = await findUser({ where: args.where, select: { id: true, name: true, email: true, customName: true, customEmail: true } });
  return { id, name: customName ?? name, email: customEmail ?? email };
}

export const createUser = async <Select extends Prisma.UserSelect, Include extends Prisma.UserInclude>(args: { data: z.infer<typeof userCreateSchema>, select?: Select, include?: Include }) => {
  userCreateSchema.parse(args.data);
  return prisma.user.create({ data: { customName: args.data.name, customEmail: args.data.email } });
}

export const updateUser = async <Where extends Prisma.UserWhereUniqueInput, Select extends Prisma.UserSelect>(args: { where: Where, data: z.infer<typeof userCreateSchema>, select?: Select }) => {
  userUpdateSchema.parse({ ...args.data, id: args.where.id });
  return await prisma.$transaction(async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: args.where });
    const customName = args.data.name === user.name ? null : args.data.name;
    const customEmail = args.data.email === user.email ? null : args.data.email;
    return await prisma.user.update({ ...args, data: { customName, customEmail } });
  });
}
