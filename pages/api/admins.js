import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { USER_TYPE_ADMIN } from '../../components';
import { replyForbidden, replyMethodNotAllowed, replyUnauthorized } from '../../components/api';

const prisma = new PrismaClient();

export default async function admins(req, res) {
  if(req.method === 'GET') {
    const session = await getSession({ req });
    if(!session) {
      replyUnauthorized(res);
    } else if(session.userType === USER_TYPE_ADMIN) {
      const users = await prisma.admins.findMany();
      res.status(200).json(users);
    } else {
      replyForbidden(res);
    }
  } else {
    replyMethodNotAllowed(res);
  }
}
