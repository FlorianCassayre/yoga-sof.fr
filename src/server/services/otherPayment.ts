import { OtherPayment, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { otherPaymentCreateSchema, otherPaymentUpdateSchema } from '../../common/schemas/otherPayment';
import { z } from 'zod';

const transformFromForm = ({ category: { id }, amount, ...rest }: z.infer<typeof otherPaymentCreateSchema>): Pick<OtherPayment, 'description' | 'amountCents' | 'provider' | 'recipient' | 'date'> & { category: { connect: { id: number } } } =>
  ({ category: { connect: { id } }, amountCents: Math.round(amount * 100), ...rest });
const transformToForm = ({ amountCents, ...rest }: Prisma.OtherPaymentGetPayload<{ select: { id: true, category: true, description: true, amountCents: true, provider: true, recipient: true, date: true } }>): z.infer<typeof otherPaymentUpdateSchema> =>
  ({ amount: amountCents / 100, ...rest });

export const findOtherPayment = async (args: { where: Prisma.OtherPaymentWhereUniqueInput }) =>
  prisma.otherPayment.findUniqueOrThrow(args);

export const findUpdateOtherPayment = async (args: { where: Prisma.OtherPaymentWhereUniqueInput }) => {
  const data = await prisma.otherPayment.findUniqueOrThrow({ where: args.where, include: { category: true } });
  return transformToForm(data);
}

export const findOtherPayments = async () =>
  prisma.otherPayment.findMany({ include: { category: true } });

export const createOtherPayment = async (args: { data: z.infer<typeof otherPaymentCreateSchema> }) => {
  otherPaymentCreateSchema.parse(args.data);
  return prisma.otherPayment.create({ data: transformFromForm(args.data) });
}

export const updateOtherPayment = async (args: { where: Prisma.OtherPaymentWhereUniqueInput, data: Omit<z.infer<typeof otherPaymentUpdateSchema>, 'id'> }) => {
  otherPaymentUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.otherPayment.update({ where: args.where, data: transformFromForm(args.data) });
}

export const deleteOtherPayment = async (args: { where: Prisma.OtherPaymentWhereUniqueInput }) =>
  prisma.otherPayment.delete(args);
