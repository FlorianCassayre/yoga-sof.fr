import { Prisma, User } from '@prisma/client';
import { prisma, transactionOptions } from '../prisma';
import {
  userCreateSchema,
  userDisableSchema,
  userSchemaBase,
  userUpdateSchema,
  userUpdateSelfSchema
} from '../../common/schemas/user';
import { z } from 'zod';
import { isWhitelistedAdmin } from './adminWhitelist';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

export const findUser = async <Where extends Prisma.UserWhereUniqueInput, Select extends Prisma.UserSelect, Include extends Prisma.UserInclude>(prisma: Prisma.TransactionClient, args: { where: Where, select?: Select, include?: Include }) =>
  prisma.user.findUniqueOrThrow(args);

export const findUsers = async <Where extends Prisma.UserWhereInput, Select extends Prisma.UserSelect, Include extends Prisma.UserInclude, OrderBy extends Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>>(args: { where?: Where, select?: Select, include?: Include, orderBy?: OrderBy } = {}) =>
  prisma.user.findMany(args);

export const findUserUpdate = async <Where extends Prisma.UserWhereUniqueInput>(prisma: Prisma.TransactionClient, args: { where: Where }) => {
  const { id, name, email, customName, customEmail, managedByUserId } = await findUser(prisma, { where: args.where, select: { id: true, name: true, email: true, customName: true, customEmail: true, managedByUserId: true } });
  return { id, name: customName ?? name, email: customEmail ?? email, managedByUserId };
}

export const findManaged = async (args: { where: Prisma.UserWhereUniqueInput }) => {
  const { managedByUser, managedUsers } = await prisma.user.findUniqueOrThrow({ where: args.where, include: { managedByUser: true, managedUsers: true } });
  return { managedByUser, managedUsers };
};

export const validateControlsUser = async (prisma: Prisma.TransactionClient, args: { where: { id: number, userId: number } }) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: args.where.id }, select: { managedUsers: { select: { id: true } } } });
  if (!(args.where.id === args.where.userId || user.managedUsers.some(({ id }) => id === args.where.userId))) {
    throw new ServiceError(ServiceErrorCode.UserCannotControlUser);
  }
};

export const createUser = async <Select extends Prisma.UserSelect, Include extends Prisma.UserInclude>(prisma: Prisma.TransactionClient, args: { data: z.infer<typeof userCreateSchema>, select?: Select, include?: Include }) => {
  userCreateSchema.parse(args.data);
  // No need to validate the user manager in create, it is correct is all cases wrt to the current logic
  return prisma.user.create({ data: { customName: args.data.name, customEmail: args.data.email, managedByUserId: args.data.managedByUserId } });
}

export const updateUser = async <Where extends Prisma.UserWhereUniqueInput, Select extends Prisma.UserSelect>(args: { where: Where, data: z.infer<typeof userCreateSchema>, select?: Select }) => {
  userUpdateSchema.parse({ ...args.data, id: args.where.id });
  // Validate user manager
  if (args.where.id === args.data.managedByUserId) {
    throw new ServiceError(ServiceErrorCode.UserCannotManageThemselves);
  }
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findUniqueOrThrow({ where: args.where, include: { managedUsers: true } });
    if (args.data.managedByUserId !== null && user.managedUsers.length > 0) {
      throw new ServiceError(ServiceErrorCode.UserAlreadyManages);
    }
    await updateUserInformation(prisma, { where: args.where, data: { name: args.data.name, email: args.data.email } });
    return prisma.user.update({ where: args.where, data: { managedByUserId: args.data.managedByUserId } });
  }, transactionOptions);
}

export const updateUserInformation = async <Where extends Prisma.UserWhereUniqueInput, Select extends Prisma.UserSelect>(prisma: Prisma.TransactionClient, args: { where: Where, data: z.infer<typeof userSchemaBase>, select?: Select }) => {
  userUpdateSelfSchema.parse({ ...args.data, id: args.where.id });
  const user = await prisma.user.findUniqueOrThrow({ where: args.where, include: { managedUsers: true } });
  const customName = args.data.name === user.name ? null : args.data.name;
  const customEmail = args.data.email === user.email ? null : args.data.email;
  return await prisma.user.update({ ...args, data: { customName, customEmail } });
}

export const updateUserDisable = async (args: { where: Prisma.UserWhereUniqueInput, data: Omit<z.infer<typeof userDisableSchema>, 'id'> }) => {
  userDisableSchema.parse({ ...args.where, ...args.data });
  await prisma.$transaction(async (prisma) => {
    if (args.data.disabled) {
      const user = await prisma.user.findUniqueOrThrow({ where: args.where, select: { email: true } });
      if (await isWhitelistedAdmin(prisma, user)) {
        throw new ServiceError(ServiceErrorCode.UserCannotBeDisabled);
      }
    }
    await prisma.user.update({ where: args.where, data: { disabled: args.data.disabled } });
  }, transactionOptions);
};
