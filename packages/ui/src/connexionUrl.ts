export const connexionUrl = (redirectTo = '/') => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '/';
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  return `${base}/connexion?r=${encodeURIComponent(redirectTo)}`;
};
