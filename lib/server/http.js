import Joi from 'joi';
import { getSession } from 'next-auth/react';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export const apiHandler = routes => async (req, res) => {
  const reject = (message, code = 400, details = undefined) => {
    res.status(code).json({ error: message, details });
  };
  const accept = (content = {}) => {
    res.status(200).json(content);
  };

  if (ALLOWED_METHODS.includes(req.method) && routes[req.method] !== undefined) {
    const route = routes[req.method];
    const { permissions, action, schemaQuery = Joi.object({}), schemaBody = Joi.object({}) } = route;

    const session = await getSession({ req });

    if (permissions && !session) {
      reject('Unauthorized', 401);
    } else if (permissions && !permissions.includes(session.userType)) {
      reject('Forbidden', 403);
    } else {
      const userId = session ? session.userId : null;

      let queryValue = req.query;
      if (schemaQuery) {
        const { value, error } = schemaQuery.validate(req.query, { convert: true });
        if (error != null) {
          reject('Bad Request: query', 400, error.details);
          return;
        }
        queryValue = value;
      }

      const bodyValue = req.body === '' ? {} : req.body;
      if (schemaBody) {
        const { error } = schemaBody.validate(bodyValue);
        if (error != null) {
          reject('Bad Request: body', 400, error.details);
          return;
        }
      }

      await action({ reject, accept, userId, query: queryValue, body: bodyValue });
    }
  } else {
    reject('Method Not Allowed', 405);
  }
};
