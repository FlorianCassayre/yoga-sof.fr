import { Session } from 'next-auth';

export interface ContextUnprotected {
  session: Session | null;
}

export interface ContextProtected {
  session: Session;
}
