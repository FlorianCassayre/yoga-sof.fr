import { getSession } from 'next-auth/react';
import { USER_TYPE_ADMIN } from '../../components';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else if(session.userType === USER_TYPE_ADMIN) {
      const { user_id, session_id } = req.body;

      const userId = parseInt(user_id), sessionId = parseInt(session_id);

      if(!isNaN(userId) && !isNaN(sessionId)) {
        try {
          const result = await prisma.$transaction(async () => {
            const existsRegistration = !!(await prisma.registrations.count({
              where: {
                session_id: sessionId,
                user_id: userId,
                is_user_canceled: false,
                // TODO (check date) + cancel status
              },
            }));

            if(existsRegistration) {
              throw new Error('user is already registered');
            }

            return await prisma.registrations.create({
              data: {
                session_id: sessionId,
                user_id: userId,
              }
            });
          });

          res.status(200).json(result);
        } catch(error) {
          console.log(error)
          res.status(400).json({ error: 'Bad Request: illegal' });
        }
      } else {
        res.status(400).json({ error: 'Bad Request' });
      }
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
