import { NextApiRequest, NextApiResponse } from 'next';
import { cronExecuteSchema } from '../common/schemas/cron';

// curl -X POST "http://localhost:3000/api/cron/<daily|hourly>" -H "Content-Type: application/json" -d '{"token":"CRON_TOKEN"}'

export const createCronHandler = (handler: () => Promise<void>) => async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405);
  } else {
    const result = cronExecuteSchema.safeParse(req.body);

    if (result.success) {
      if (result.data.token === process.env.CRON_TOKEN) {
        await handler();
        res.status(200);
      } else {
        res.status(403);
      }
    } else {
      res.status(400);
    }
  }
  return res.json({});
}
