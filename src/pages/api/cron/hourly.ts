import { NextApiRequest, NextApiResponse } from 'next';
import { executeHourly } from '../../../server/services/cron';
import { createCronHandler } from '../../../server/cron';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return createCronHandler(executeHourly)(req, res);
}
