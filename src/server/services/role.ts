import { z } from 'zod';

export const isInitiallyAdmin = (user: { email?: string | null }) => {
  if (
    user.email
    && z.string().email().safeParse(user.email).success
    && process.env.SEED_EMAILS_ADMIN
  ) {
    const whitelistedAddresses = process.env.SEED_EMAILS_ADMIN.split(',');
    return whitelistedAddresses.includes(user.email);
  } else {
    return false;
  }
};
