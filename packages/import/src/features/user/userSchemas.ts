// Auth.js requires user ids to be UUIDs; derive them deterministically from the legacy ids.
export const USER_ID_NAMESPACE = '4b6fca5e-9e14-4a4d-8b9f-2b48ce6f5d31';

export const USERS_TABLE = 'user';
export const ACCOUNTS_TABLE = 'account';

export const USER_COLUMNS = {
  id: 0,
  name: 1,
  email: 2,
  email_verified: 3,
  image: 4,
  custom_email: 5,
  custom_name: 6,
  public_access_token: 7,
  receive_emails: 8,
  created_at: 9,
  last_activity: 10,
  disabled: 11,
  managed_by_user_id: 12,
  role: 13,
} as const;

export const ACCOUNT_COLUMNS = {
  id: 0,
  user_id: 1,
  type: 2,
  provider: 3,
  provider_account_id: 4,
  refresh_token: 5,
  access_token: 6,
  expires_at: 7,
  token_type: 8,
  scope: 9,
  id_token: 10,
  session_state: 11,
  created_at: 12,
  updated_at: 13,
} as const;

export const ROLES = {
  ADMINISTRATOR: 'administrator',
  MANAGER: 'manager',
  ASSOCIATE: 'associate',
} as const;
