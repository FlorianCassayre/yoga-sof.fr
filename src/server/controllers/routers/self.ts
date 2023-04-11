import { z } from 'zod';
import {
  cancelCourseRegistration,
  createCourseRegistrations, createUser,
  findCourseRegistrationsPublic,
  findManaged,
  findUserUpdate,
  updateUserInformation, validateControlsUser
} from '../../services';
import { readTransaction, writeTransaction } from '../../prisma';
import { userUpdateSelfSchema } from '../../../common/schemas/user';
import { frontsiteCourseRegistrationSchema } from '../../../common/schemas/frontsiteCourseRegistration';
import { router, userProcedure } from '../trpc';
import { User } from '@prisma/client';
import { displayUserName } from '../../../common/display';
import { findCouponsPublic } from '../../services/coupon';
import { findMembershipsPublic } from '../../services/membership';

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
      return await readTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        return findCourseRegistrationsPublic(prisma, { userId, future, userCanceled });
      });
    }),
  findAllCoupons: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
    }))
    .query(async ({ input: { userId }, ctx: { session: { userId: requesterId } } }) => {
      return await readTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        return findCouponsPublic(prisma, { where: { userId } });
      });
    }),
  findAllMemberships: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
    }))
    .query(async ({ input: { userId }, ctx: { session: { userId: requesterId } } }) => {
      return await readTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        return findMembershipsPublic(prisma, { where: { userId } });
      });
    }),
  profile: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
    }))
    .query(async ({ input: { userId }, ctx: { session: { userId: requesterId } } }) => {
      return await readTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        const { name, email } = await findUserUpdate(prisma, { where: { id: userId } });
        return { name, email };
      });
    }),
  cancelRegistration: userProcedure
    .input(z.strictObject({
      userId: z.number().int().min(0),
      id: z.number().int().min(0),
    }))
    .mutation(async ({ input: { userId, id }, ctx: { session: { userId: requesterId } } }) => {
      await writeTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        await prisma.courseRegistration.findFirstOrThrow({ where: { id, userId } }); // Access control
        await cancelCourseRegistration(prisma, { where: { id }, data: { admin: false } }).then(({ id }) => ({ id }));
      });
      return { id };
    }),
  updateProfile: userProcedure
    .input(userUpdateSelfSchema)
    .mutation(async ({ input: { id, name, email }, ctx: { session: { userId: requesterId } } }) => {
      await writeTransaction(async (prisma) => {
        await validateControlsUser(prisma, { where: { id: requesterId, userId: id } });
        await updateUserInformation(prisma, { where: { id }, data: { name, email } });
      });
    }),
  register: userProcedure
    .input(frontsiteCourseRegistrationSchema)
    .mutation(async ({ input: { userId, courseIds, notify, name, email }, ctx: { session: { userId: requesterId } } }) => {
      const sendMailCallback = await writeTransaction(async (prisma) => {
        if (userId !== null) {
          await validateControlsUser(prisma, { where: { id: requesterId, userId } });
        }
        // Retrieve the existing user, or create a new user and attach it to the requester
        const nonNullUserId = userId ?? (await createUser(prisma, { data: { name, email, managedByUserId: requesterId } })).id;
        if (userId !== null) { // Avoid a useless write
          await updateUserInformation(prisma, { where: { id: nonNullUserId }, data: { name, email } });
        }
        const [, sendMailCallback] = await createCourseRegistrations(prisma, { data: { users: [nonNullUserId], courses: courseIds, notify, admin: false } });
        return sendMailCallback;
      });
      await sendMailCallback();
    }),
});
