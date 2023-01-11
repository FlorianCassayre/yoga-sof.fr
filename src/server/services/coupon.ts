import { Prisma } from '@prisma/client';
import { prisma, transactionOptions } from '../prisma';
import crypto from 'crypto';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

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

export const findCoupons = async (args: { where: { includeDisabled: boolean } }) =>
  prisma.coupon.findMany({ where: { disabled: args.where.includeDisabled ? undefined : false }, include: { user: true } });

export const createCoupon = async (args: { data: { couponModelId: number, userId: number, free?: boolean } }) => prisma.$transaction(async (prisma) => {
  const { id, price, ...couponModel } = await prisma.couponModel.findUniqueOrThrow({ where: { id: args.data.couponModelId } });
  const code = generateSecureRandomCouponId();
  return prisma.coupon.create({ data: { ...couponModel, price: args.data.free ? 0 : price, code, userId: args.data.userId } });
}, transactionOptions);

export const disableCoupon = async (args: { where: Prisma.CouponWhereUniqueInput }) => {
  return await prisma.$transaction(async (prisma) => {
    const coupon = await prisma.coupon.findUniqueOrThrow(args);
    if (coupon.disabled) {
      throw new ServiceError(ServiceErrorCode.FewerSlotsThanRegistered);
    }
    return await prisma.coupon.update({ where: args.where, data: { disabled: true } });
  }, transactionOptions);
};
