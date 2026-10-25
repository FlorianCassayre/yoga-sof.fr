'use server';

import { signIn } from '@yoga-sof/ui/auth';

import { resolveRedirectTarget } from './redirectTarget';

export const signInWithGoogle = async (raw: string | undefined) => {
  const target = resolveRedirectTarget(raw);

  await signIn('google', {
    redirectTo: target === '/' ? undefined : `/redirection?r=${encodeURIComponent(target)}`,
  });
};
