import NextCrud, { HttpError, PrismaAdapter, RouteType } from '@premieroctet/next-crud';
import { parsePrismaCursor } from '@premieroctet/next-crud/dist/adapters/prisma/utils/parseCursor';
import { parsePrismaRecursiveField } from '@premieroctet/next-crud/dist/adapters/prisma/utils/parseRecursive';
import { parsePrismaWhere } from '@premieroctet/next-crud/dist/adapters/prisma/utils/parseWhere';
import { getSession } from 'next-auth/react';
import { isPermitted, prisma, validateData } from '../../lib/server';

class CustomPrismaAdapter extends PrismaAdapter {
  parseQuery(resourceName, query) {
    // Copied from: https://github.com/premieroctet/next-crud/blob/master/src/adapters/prisma/index.ts
    const parsed = {};
    if (query.select) {
      parsed.select = parsePrismaRecursiveField(query.select, 'select');
    }
    if (query.include) {
      parsed.include = parsePrismaRecursiveField(query.include, 'include');
    }
    if (query.originalQuery?.where) {
      parsed.where = parsePrismaWhere(
        JSON.parse(query.originalQuery.where),
        this.manyRelations[resourceName] ?? [],
      );
    }
    if (query.orderBy) {
      // Begin customization
      let orderBy = {};
      Object.keys(query.orderBy).forEach(key => {
        const value = query.orderBy[key];
        const parts = key.split('.');
        const operatorsAssociation = {
          $asc: 'asc',
          $desc: 'desc',
        };
        orderBy = operatorsAssociation[value];
        for (let i = parts.length - 1; i >= 0; i--) {
          const part = parts[i];
          orderBy = { [part]: orderBy };
        }
      });
      parsed.orderBy = orderBy;
      // End customization
    }
    if (typeof query.limit !== 'undefined') {
      parsed.take = query.limit;
    }
    if (typeof query.skip !== 'undefined') {
      parsed.skip = query.skip;
    }
    if (query.originalQuery?.cursor) {
      parsed.cursor = parsePrismaCursor(JSON.parse(query.originalQuery.cursor));
    }
    if (query.distinct) {
      parsed.distinct = query.distinct;
    }

    return parsed;
  }
}

const handler = NextCrud({
  adapter: new CustomPrismaAdapter({ prismaClient: prisma }),
  onRequest: async (req, _res, { resourceName, routeType, resourceId }) => {
    if (req.method === 'PATCH') {
      throw new HttpError(405, 'use PUT instead'); // Dirty but necessary to prevent validation bypassing
    }

    const session = await getSession({ req });

    if (!isPermitted(resourceName, resourceId, routeType, session?.userType)) {
      if (session) {
        throw new HttpError(403, `you don't have the required rights to perform this action`);
      } else {
        throw new HttpError(401, 'you must be logged in to perform this action');
      }
    }

    if (routeType === RouteType.CREATE || routeType === RouteType.UPDATE) {
      validateData(resourceName, routeType, req.body);
    }

    // Else: OK
  },
  onError: async (req, res, error) => {
    // eslint-disable-next-line
    error.message = { // JSON response
      error: error.message,
    };
  },
});

export default handler;
