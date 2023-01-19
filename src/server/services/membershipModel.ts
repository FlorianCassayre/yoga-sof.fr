import { MembershipModel, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { membershipModelCreateSchema, membershipModelUpdateSchema } from '../../common/schemas/membershipModel';

export const findMembershipModel = async (args: { where: Prisma.MembershipModelWhereUniqueInput }) =>
  prisma.membershipModel.findUniqueOrThrow(args);

export const findMembershipModels = async () =>
  prisma.membershipModel.findMany({ orderBy: [{ id: 'asc' }] });

export const createMembershipModel = async (args: { data: Prisma.MembershipModelCreateInput }) => {
  membershipModelCreateSchema.parse(args.data);
  return prisma.membershipModel.create(args);
}

export const updateMembershipModel = async (args: { where: Prisma.MembershipModelWhereUniqueInput, data: Omit<MembershipModel, 'id'> }) => {
  membershipModelUpdateSchema.parse({ ...args.data, id: args.where.id });
  return prisma.membershipModel.update(args);
}

export const deleteMembershipModel = async (args: { where: Prisma.MembershipModelWhereUniqueInput }) =>
  prisma.membershipModel.delete(args);
