import NextCrud, { HttpError, PrismaAdapter, RouteType } from '@premieroctet/next-crud';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { isPermitted } from '../../components';

const prisma = new PrismaClient();

const handler = NextCrud({
  adapter: new PrismaAdapter({
    prismaClient: prisma,
  }),
  onRequest: async (req, _res, { resourceName, routeType, resourceId }) => {
    const session = await getSession({ req });

    if(!isPermitted(resourceName, resourceId, routeType, session?.userType)) {
      if(session) {
        throw new HttpError(403, 'you don\'t have the required rights to perform this action');
      } else {
        throw new HttpError(401, 'you must be logged in to perform this action');
      }
    }

    // Else: OK
  }
});

export default handler;
