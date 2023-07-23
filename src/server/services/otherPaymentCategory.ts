import { OtherPaymentCategory, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { otherPaymentCategoryCreateSchema, otherPaymentCategoryUpdateSchema } from '../../common/schemas/otherPaymentCategory';

export const findOtherPaymentCategory = async (args: { where: Prisma.OtherPaymentCategoryWhereUniqueInput }) =>
  prisma.otherPaymentCategory.findUniqueOrThrow(args);

export const findOtherPaymentCategories = async () =>
  prisma.otherPaymentCategory.findMany({ include: { _count: true } });

export const createOtherPaymentCategory = async (args: { data: Prisma.OtherPaymentCategoryCreateInput }) => {
  otherPaymentCategoryCreateSchema.parse(args.data);
  return prisma.otherPaymentCategory.create(args);
}

export const updateOtherPaymentCategory = async (args: { where: Prisma.OtherPaymentCategoryWhereUniqueInput, data: Omit<OtherPaymentCategory, 'id'> }) => {
  otherPaymentCategoryUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.otherPaymentCategory.update(args);
}

export const deleteOtherPaymentCategory = async (args: { where: Prisma.OtherPaymentCategoryWhereUniqueInput }) =>
  prisma.otherPaymentCategory.delete(args);
