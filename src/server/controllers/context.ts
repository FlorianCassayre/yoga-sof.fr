import { Session } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';

export interface Context {
  req: NextApiRequest;
  res: NextApiResponse;
}

export interface ContextUnprotected {
  session: Session | null;
}

export interface ContextProtected {
  session: Session;
}
