import { getSession } from 'next-auth/react';
import Joi from 'joi';

const schema = Joi.object({
  sessions: Joi.array().required().min(1).max(100).unique().items(Joi.number().integer().required()),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if(!session) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const { user: { db_id: userId } } = session;
      const { value: { sessions }, error } = schema.validate(req.body);

      if(error == null) {
        const now = new Date();

        try {
          await prisma.$transaction(sessions.map(sessionId =>
            prisma.$executeRaw`
              INSERT INTO registrations (session_id, user_id) VALUES (
                (SELECT id FROM sessions AS tmp1 WHERE
                  id = ${sessionId} AND
                  NOT is_canceled AND
                  ${now} < date_start AND
                  NOT EXISTS(SELECT * FROM registrations AS tmp2 WHERE user_id = ${userId} AND session_id = ${sessionId} AND NOT is_user_canceled) AND
                  (SELECT COUNT(*) FROM registrations AS tmp3 WHERE session_id = ${sessionId} AND NOT is_user_canceled) < slots),
                ${userId}
            )
          `
          ));

          res.status(200).json({});
        } catch (e) {
          res.status(400).json({ error: 'Bad Request' });
        }
      } else {
        res.status(400).json({ error: `Bad Request: ${error}` });
      }
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
