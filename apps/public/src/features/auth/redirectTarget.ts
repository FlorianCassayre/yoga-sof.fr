const DEFAULT_REDIRECT = '/';

// URL parsers strip tab, LF, CR (and other whitespace) anywhere in a URL, so
// "/\t/evil.com" would become a protocol-relative URL: reject them outright.
// \p{Cc} also covers NUL bytes and other control characters.
const FORBIDDEN_CHARACTERS = /[\s\p{Cc}]/u;

const adminUrl = (): string | undefined => {
  const url = process.env.NEXT_ADMIN_SITE_URL?.replace(/\/+$/, '');

  return url === '' ? undefined : url;
};

export const isAdminRedirectTarget = (target: string): boolean => {
  const url = adminUrl();

  return !!url && (target === url || target.startsWith(`${url}/`));
};

export const adminRedirectRoot = (): string => adminUrl() ?? DEFAULT_REDIRECT;

export const resolveRedirectTarget = (raw: string | undefined): string => {
  if (!raw || FORBIDDEN_CHARACTERS.test(raw)) {
    return DEFAULT_REDIRECT;
  }

  if (isAdminRedirectTarget(raw)) {
    return raw;
  }

  return raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')
    ? raw
    : DEFAULT_REDIRECT;
};
