import { MembershipModel, MembershipType, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { membershipModelCreateSchema, membershipModelUpdateSchema } from '../../common/schemas/membershipModel';
import crypto from 'crypto';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { membershipCreateSchema } from '../../common/schemas/membership';

export const findMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) =>
  prisma.membership.findUniqueOrThrow(args);

export const findMemberships = async (args: { where: { includeDisabled: boolean } }) =>
  prisma.membership.findMany({ where: { disabled: args.where.includeDisabled ? undefined : false }, include: { users: true } });

export const createMembership = async (args: { data: { membershipModelId: MembershipType, dateStart: Date, users: number[] } }) => {
  membershipCreateSchema.parse(args.data);
  const { id: type, price } = await prisma.membershipModel.findUniqueOrThrow({ where: { id: args.data.membershipModelId } });
  const dateEnd = new Date(args.data.dateStart);
  dateEnd.setFullYear(dateEnd.getFullYear() + 1);
  dateEnd.setDate(dateEnd.getDate() - 1);
  return prisma.membership.create({ data: { type, dateStart: args.data.dateStart, dateEnd, price, users: { connect: args.data.users.map(id => ({ id })) } } });
};

export const disableMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) => {
  return await prisma.$transaction(async () => {
    const membership = await prisma.membership.findUniqueOrThrow(args);
    if (membership.disabled) {
      throw new ServiceError(ServiceErrorCode.MembershipAlreadyDisabled);
    }
    return await prisma.membership.update({ where: args.where, data: { disabled: true } });
  });
};
