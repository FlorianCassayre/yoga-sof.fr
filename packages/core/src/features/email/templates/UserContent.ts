export interface EmailUser {
  id: string;
  name: string | null;
}

export interface UserContent {
  user: EmailUser;
  casual?: boolean;
}
