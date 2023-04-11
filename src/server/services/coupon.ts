import { Prisma } from '@prisma/client';
import { prisma, writeTransaction } from '../prisma';
import crypto from 'crypto';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import { couponCreateSchema } from '../../common/schemas/coupon';

const COUPON_LENGTH = 8;
const COUPON_ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';

const generateSecureRandomCouponId = (): string => {
  const chars: string[] = [];
  for (let i = 0; i < COUPON_LENGTH; i++) {
    chars.push(COUPON_ALPHABET[crypto.randomInt(COUPON_ALPHABET.length)]);
  }
  return chars.join('');
};

export const findCoupon = async (args: { where: Prisma.CouponWhereUniqueInput }) =>
  prisma.coupon.findUniqueOrThrow(args);

export const findCoupons = async (args: { where: { includeDisabled: boolean, userId?: number, noOrder?: boolean } }) =>
  prisma.coupon.findMany({
    where: {
      disabled: args.where.includeDisabled ? undefined : false,
      userId: args.where.userId, ...(args.where.noOrder ? { ordersPurchased: { every: { active: false } } } : {}),
    },
    include: {
      user: true,
      ordersPurchased: { where: { active: true }, select: { id: true } },
      orderCourseRegistrations: { where: { order: { active: true } }, select: { courseRegistrationId: true } },
    },
  });

export const createCoupon = async (prisma: Prisma.TransactionClient, args: { data: { couponModelId: number, userId: number, free?: boolean } }) => {
  couponCreateSchema.parse(args.data);
  const { id, price, ...couponModel } = await prisma.couponModel.findUniqueOrThrow({ where: { id: args.data.couponModelId } });
  const code = generateSecureRandomCouponId();
  return prisma.coupon.create({ data: { ...couponModel, price: args.data.free ? 0 : price, code, userId: args.data.userId } });
};

export const disableCoupon = async (args: { where: Prisma.CouponWhereUniqueInput }) => {
  return await writeTransaction(async (prisma) => {
    const coupon = await prisma.coupon.findUniqueOrThrow(args);
    if (coupon.disabled) {
      throw new ServiceError(ServiceErrorCode.CouponAlreadyDisabled);
    }
    return await prisma.coupon.update({ where: args.where, data: { disabled: true } });
  });
};

export const findCouponsPublic = async (prisma: Prisma.TransactionClient, args: { where: { userId: number } }) => {
  return (await findCoupons({ where: { userId: args.where.userId, includeDisabled: false } })).map(({ id, courseType, code, quantity, orderCourseRegistrations, ordersPurchased, createdAt }) => ({
    id,
    courseType,
    code,
    quantity,
    remaining: quantity - orderCourseRegistrations.length,
    createdAt,
    paid: ordersPurchased.length > 0,
  }));
};
