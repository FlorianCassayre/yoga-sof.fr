import { z } from 'zod';
import {
  cancelCourseRegistration,
  createCourseRegistrations, createUser,
  findCourseRegistrations, findCourseRegistrationsPublic,
  findManaged, findUser,
  findUserUpdate,
  updateUser, updateUserInformation, validateControlsUser
} from '../../services';
import { prisma, transactionOptions } from '../../prisma';
import { userSchemaBase, userUpdateSchema, userUpdateSelfSchema } from '../../../common/schemas/user';
import { frontsiteCourseRegistrationSchema } from '../../../common/schemas/frontsiteCourseRegistration';
import { router, userProcedure } from '../trpc';
import { User } from '@prisma/client';
import { displayUserName } from '../../../common/display';
import { ServiceError, ServiceErrorCode } from '../../services/helpers/errors';

// It is important to control the data that we return from this router, since it is accessible to any logged-in user

export const selfRouter = router({
  managedUsers: userProcedure
    .query(async ({ ctx: { session: { userId } } }) => {
      const mapUser = (user: User) => ({ id: user.id, name: displayUserName(user), publicAccessToken: user.publicAccessToken });
      const { managedByUser, managedUsers } = await findManaged({ where: { id: userId } });
      return { managedByUser: managedByUser ? mapUser(managedByUser) : null, managedUsers: managedUsers.map(user => mapUser(user)) };
    }),
  findAllRegisteredCourses: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
      userCanceled: z.boolean(),
      future: z.boolean().nullable(),
    }))
    .query(async ({ input: { userId, future, userCanceled }, ctx: { session: { userId: requesterId } } }) => {
      return await prisma.$transaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        return findCourseRegistrationsPublic(prisma, { userId, future, userCanceled });
      }, transactionOptions);
    }),
  profile: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
    }))
    .query(async ({ input: { userId }, ctx: { session: { userId: requesterId } } }) => {
      return await prisma.$transaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        const { name, email } = await findUserUpdate(prisma, { where: { id: userId } });
        return { name, email };
      }, transactionOptions);
    }),
  cancelRegistration: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
      id: z.number().int().min(0),
    }))
    .mutation(async ({ input: { userId, id }, ctx: { session: { userId: requesterId } } }) => {
      await prisma.$transaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        await prisma.courseRegistration.findFirstOrThrow({ where: { id, userId } }); // Access control
        await cancelCourseRegistration(prisma, { where: { id } }).then(({ id }) => ({ id }));
      }, transactionOptions);
      return { id };
    }),
  updateProfile: userProcedure
    .input(userUpdateSelfSchema)
    .mutation(async ({ input: { id, name, email }, ctx: { session: { userId: requesterId } } }) => {
      await prisma.$transaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId: id } });
        await updateUserInformation(prisma, { where: { id }, data: { name, email } });
      }, transactionOptions);
    }),
  register: userProcedure
    .input(frontsiteCourseRegistrationSchema)
    .mutation(async ({ input: { userId, courseIds, notify, name, email }, ctx: { session: { userId: requesterId } } }) => {
      await prisma.$transaction(async (prisma) => {
        if (userId !== null) {
          await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        }
        // Retrieve the existing user, or create a new user and attach it to the requester
        const nonNullUserId = userId ?? (await createUser({ data: { name, email, managedByUserId: requesterId } })).id;
        await createCourseRegistrations({ data: { users: [nonNullUserId], courses: courseIds, notify } });
        if (userId !== null) { // Avoid a useless write
          await updateUserInformation(prisma, { where: { id: nonNullUserId }, data: { name, email } });
        }
      }, transactionOptions);
    }),
});
