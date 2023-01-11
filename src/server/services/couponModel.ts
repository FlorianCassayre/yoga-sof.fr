import { CouponModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { couponModelCreateSchema, couponModelUpdateSchema } from '../../common/schemas/couponModel';

export const findCouponModel = async (args: { where: Prisma.CouponModelWhereUniqueInput }) =>
  prisma.couponModel.findUniqueOrThrow(args);

export const findCouponModels = async () =>
  (await prisma.couponModel.findMany()).sort((a, b) => a.courseType < b.courseType ? -1 : a.courseType > b.courseType ? 1 : b.quantity - a.quantity);

export const createCouponModel = async (args: { data: Prisma.CouponModelCreateInput }) => {
  couponModelCreateSchema.parse(args.data);
  return prisma.couponModel.create(args);
}

export const updateCouponModel = async (args: { where: Prisma.CouponModelWhereUniqueInput, data: Omit<CouponModel, 'id'> }) => {
  couponModelUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.couponModel.update(args);
}

export const deleteCouponModel = async (args: { where: Prisma.CouponModelWhereUniqueInput }) =>
  prisma.couponModel.delete(args);
