import { NextApiRequest, NextApiResponse } from 'next';
import { cronExecuteSchema } from '../../../lib/common/newSchemas/cron';
import { executeDaily } from '../../../lib/server/services/cron';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  const result = cronExecuteSchema.safeParse(req.body);

  if (result.success) {
    if (result.data.token === process.env.CRON_TOKEN) {
      await executeDaily();
      res.status(200);
    } else {
      res.status(403);
    }
  } else {
    res.status(400);
  }
}
