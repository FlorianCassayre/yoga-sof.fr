import Joi from 'joi';
import { apiHandler, notifyCourseNewcomers } from '../../../lib/server';

const executeDaily = async () => {
  await notifyCourseNewcomers();
};

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      schemaBody: Joi.object({
        token: Joi.string().required(),
      }),
      action: async ({ accept, reject, body: { token } }) => {
        if (token === process.env.CRON_TOKEN) {
          await executeDaily();
          accept({});
        } else {
          reject('Forbidden: invalid token', 403);
        }
      },
    },
  })(req, res);
}
