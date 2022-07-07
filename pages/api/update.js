import Joi from 'joi';
import { apiHandler } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      schemaBody: Joi.object({
        token: Joi.string().required(),
      }),
      action: async ({ accept, reject, body: { token } }) => {
        if (token === process.env.UPDATE_TOKEN) {
          accept({});
          process.exit();
        } else {
          reject('Forbidden: invalid token', 403);
        }
      },
    },
  })(req, res);
}
