import { NextApiRequest, NextApiResponse } from 'next';
import { updateServerSchema } from '../../common/schemas/maintenance';
import { stopServer } from '../../server/services/maintenance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  const result = updateServerSchema.safeParse(req.body);

  if (result.success) {
    if (result.data.token === process.env.UPDATE_TOKEN) {
      res.status(200);
      stopServer();
    } else {
      res.status(403);
    }
  } else {
    res.status(400);
  }
}
