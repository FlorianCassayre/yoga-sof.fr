import { MembershipType, Prisma } from '@prisma/client';
import { prisma, transactionOptions } from '../prisma';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { membershipCreateSchema } from '../../common/schemas/membership';

const isValidDate = (d: Date) => d instanceof Date && !isNaN(d as any);

const removeTime = (d: Date) => {
  const copy = new Date(d);
  copy.setMilliseconds(0);
  copy.setSeconds(0);
  copy.setMinutes(0);
  copy.setHours(0);
  return copy;
};

const membershipEndDateFor = (dateStart: Date): Date => {
  const dateEnd = new Date(dateStart);
  dateEnd.setFullYear(dateEnd.getFullYear() + 1);
  dateEnd.setDate(dateEnd.getDate() - 1);
  return dateEnd;
}

export const findMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) =>
  prisma.membership.findUniqueOrThrow(args);

export const findMemberships = async (args: { where: { includeDisabled: boolean, userId?: number } }) => {
  const membershipArgs = { where: { disabled: args.where.includeDisabled ? undefined : false }, include: { users: true } };
  return args.where.userId === undefined
    ? prisma.membership.findMany(membershipArgs)
    : prisma.user.findUniqueOrThrow({ where: { id: args.where.userId } }).memberships(membershipArgs);
};

export const createMembership = async (args: { data: { membershipModelId: MembershipType, dateStart: Date, users: number[] } }) => prisma.$transaction(async (prisma) => {
  membershipCreateSchema.parse(args.data);
  const { id: type, price } = await prisma.membershipModel.findUniqueOrThrow({ where: { id: args.data.membershipModelId } });
  const dateEnd = membershipEndDateFor(args.data.dateStart);
  return prisma.membership.create({ data: { type, dateStart: args.data.dateStart, dateEnd, price, users: { connect: args.data.users.map(id => ({ id })) } } });
});

export const disableMembership = async (args: { where: Prisma.MembershipWhereUniqueInput }) => {
  return await prisma.$transaction(async (prisma) => {
    const membership = await prisma.membership.findUniqueOrThrow(args);
    if (membership.disabled) {
      throw new ServiceError(ServiceErrorCode.MembershipAlreadyDisabled);
    }
    return await prisma.membership.update({ where: args.where, data: { disabled: true } });
  }, transactionOptions);
};

export const computeNewMembershipsForDates = async (args: { where: { userId: number }, data: { dates: Date[], latestDate: Date } }): Promise<[Date, Date][]> => {
  const MAX_ITERATIONS = 10;
  const rawDates = [...args.data.dates, args.data.latestDate];
  if (rawDates.every(isValidDate)) { // Precondition, this should never happen
    throw new Error();
  }
  const dates = rawDates.map(d => removeTime(d)).sort((a, b) => a.getTime() - b.getTime());
  const minDate = rawDates[0], maxDate = rawDates[rawDates.length - 1];
  return prisma.$transaction(async () => {
    const currentMemberships = (await prisma.user.findUniqueOrThrow({ where: { id: args.where.userId } }).memberships({ where: { disabled: false } })).map(({ dateStart, dateEnd }) => [removeTime(dateStart), removeTime(dateEnd)] as const);
    const newMemberships: [Date, Date][] = [];
    let date = minDate;
    let i = 0;
    while (date.getTime() < maxDate.getTime()) {
      const latestExistingDate = currentMemberships
        .filter(([startDate, endDate]) => startDate.getTime() <= date.getTime() && date.getTime() <= endDate.getTime())
        .map(([startDate, endDate]) => endDate).sort((a, b) => b.getTime() - a.getTime())[0];
      if (latestExistingDate !== undefined) { // Found existing membership, using it
        date = latestExistingDate;
      } else { // No existing membership, creating one
        const newMembership: [Date, Date] = [date, membershipEndDateFor(date)];
        newMemberships.push(newMembership);
        const [dateStart, dateEnd] = newMembership;
        date = new Date(dateEnd);
        date.setDate(date.getDate() + 1); // Add one day
      }
      i += 1;
      if (i >= MAX_ITERATIONS) {
        throw new Error(); // Infinite loop safeguard
      }
    }
    return newMemberships;
  });
};
