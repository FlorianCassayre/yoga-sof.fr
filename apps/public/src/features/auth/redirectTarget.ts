const DEFAULT_REDIRECT = '/';

// URL parsers strip tab, LF, CR (and other whitespace) anywhere in a URL, so
// "/\t/evil.com" would become a protocol-relative URL: reject them outright.
// \p{Cc} also covers NUL bytes and other control characters.
const FORBIDDEN_CHARACTERS = /[\s\p{Cc}]/u;

export const resolveRedirectTarget = (raw: string | undefined): string => {
  if (!raw || FORBIDDEN_CHARACTERS.test(raw)) {
    return DEFAULT_REDIRECT;
  }

  const adminUrl = process.env.NEXT_ADMIN_SITE_URL?.replace(/\/+$/, '');

  if (adminUrl && (raw === adminUrl || raw.startsWith(`${adminUrl}/`))) {
    return raw;
  }

  return raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')
    ? raw
    : DEFAULT_REDIRECT;
};
