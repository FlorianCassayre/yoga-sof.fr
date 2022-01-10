import NextCrud, { HttpError, PrismaAdapter, RouteType } from '@premieroctet/next-crud';
import { getSession } from 'next-auth/react';
import { isPermitted } from '../../components';
import { prisma, validateData } from '../../server';

const handler = NextCrud({
  adapter: new PrismaAdapter({
    prismaClient: prisma,
  }),
  onRequest: async (req, _res, { resourceName, routeType, resourceId }) => {
    if (req.method === 'PATCH') {
      throw new HttpError(405, 'use PUT instead'); // Dirty but necessary to prevent validation bypassing
    }

    const session = await getSession({ req });

    if(!isPermitted(resourceName, resourceId, routeType, session?.userType)) {
      if(session) {
        throw new HttpError(403, 'you don\'t have the required rights to perform this action');
      } else {
        throw new HttpError(401, 'you must be logged in to perform this action');
      }
    }

    if(routeType === RouteType.CREATE || routeType === RouteType.UPDATE) {
      validateData(resourceName, routeType, req.body);
    }

    // Else: OK
  },
  // TODO
  /*onError: (req, res, error) => {
    res.json({ error: error.message });
  },*/
});

export default handler;
