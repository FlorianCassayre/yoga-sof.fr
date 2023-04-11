import { MembershipType, Prisma } from '@prisma/client';
import { prisma, writeTransaction } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { membershipCreateLegacySchema, membershipSchema } from '../../common/schemas/membership';
import { findCoupons } from './coupon';
import { displayUserName } from '../../common/display';

export const findMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) =>
  prisma.membership.findUniqueOrThrow(args);

export const findMemberships = async (args: { where: { includeDisabled: boolean, userId?: number, noOrder?: boolean } }) => {
  const membershipArgs = {
    where: {
      disabled: args.where.includeDisabled ? undefined : false,
      ...(args.where.noOrder ? { ordersPurchased: { every: { active: false } } } : {})
    },
    include: {
      users: true,
      ordersPurchased: { where: { active: true }, select: { id: true } },
    }
  };
  return args.where.userId === undefined
    ? prisma.membership.findMany(membershipArgs)
    : prisma.user.findUniqueOrThrow({ where: { id: args.where.userId } }).memberships(membershipArgs);
};

export const createMembership = async (prisma: Prisma.TransactionClient, args: { data: { membershipModelId: MembershipType, yearStart: number, users: number[] } }) => {
  membershipSchema.parse(args.data);
  const { id: type, price } = await prisma.membershipModel.findUniqueOrThrow({ where: { id: args.data.membershipModelId } });
  const dateStart = new Date();
  dateStart.setFullYear(args.data.yearStart, 9 - 1, 1); // 1st September ("09" => `8`)
  const dateEnd = new Date(dateStart);
  dateEnd.setFullYear(dateEnd.getFullYear() + 1);
  dateEnd.setDate(dateEnd.getDate() - 1);
  return prisma.membership.create({ data: { type, dateStart: dateStart, dateEnd, price, users: { connect: args.data.users.map(id => ({ id })) } } });
};

/**
 * @deprecated use {@link createMembership} instead
 */
export const createMembershipLegacy = async (args: { data: { membershipModelId: MembershipType, dateStart: Date, users: number[] } }) => writeTransaction(async (prisma) => {
  membershipCreateLegacySchema.parse(args.data);
  const { id: type, price } = await prisma.membershipModel.findUniqueOrThrow({ where: { id: args.data.membershipModelId } });
  const dateEnd = new Date(args.data.dateStart);
  dateEnd.setFullYear(dateEnd.getFullYear() + 1);
  dateEnd.setDate(dateEnd.getDate() - 1);
  return prisma.membership.create({ data: { type, dateStart: args.data.dateStart, dateEnd, price, users: { connect: args.data.users.map(id => ({ id })) } } });
});

export const disableMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) => {
  return await writeTransaction(async (prisma) => {
    const membership = await prisma.membership.findUniqueOrThrow(args);
    if (membership.disabled) {
      throw new ServiceError(ServiceErrorCode.MembershipAlreadyDisabled);
    }
    return await prisma.membership.update({ where: args.where, data: { disabled: true } });
  });
};

export const findMembershipsPublic = async (prisma: Prisma.TransactionClient, args: { where: { userId: number } }) => {
  return (await findMemberships({ where: { userId: args.where.userId, includeDisabled: false } })).map(({ id, type, dateStart, dateEnd, users, ordersPurchased }) => ({
    id,
    type,
    dateStart,
    dateEnd,
    otherUsers: users.filter(({ id }) => id !== args.where.userId).map(user => ({ id: user.id, displayName: displayUserName(user) })),
    paid: ordersPurchased.length > 0,
  }));
};
