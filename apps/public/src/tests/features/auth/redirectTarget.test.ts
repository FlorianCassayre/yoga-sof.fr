import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveRedirectTarget } from '../../../features/auth/redirectTarget';

const ADMIN_URL = 'http://localhost:3001';

describe('resolveRedirectTarget', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to / without a target', () => {
    expect(resolveRedirectTarget(undefined)).toBe('/');
    expect(resolveRedirectTarget('')).toBe('/');
  });

  it('keeps same-origin relative paths', () => {
    expect(resolveRedirectTarget('/profile')).toBe('/profile');
    expect(resolveRedirectTarget('/profil?onglet=seances')).toBe('/profil?onglet=seances');
  });

  it('rejects absolute urls', () => {
    expect(resolveRedirectTarget('https://evil.com')).toBe('/');
    expect(resolveRedirectTarget('javascript:alert(1)')).toBe('/');
    expect(resolveRedirectTarget('HTTP://LOCALHOST:3001/x')).toBe('/');
  });

  it('rejects protocol-relative and backslash tricks', () => {
    expect(resolveRedirectTarget('//evil.com')).toBe('/');
    expect(resolveRedirectTarget('/\\evil.com')).toBe('/');
    expect(resolveRedirectTarget('/\\t/evil.com')).toBe('/');
  });

  it('rejects tab, newline and control characters anywhere', () => {
    expect(resolveRedirectTarget('/\t/evil.com')).toBe('/');
    expect(resolveRedirectTarget('//\tevil.com')).toBe('/');
    expect(resolveRedirectTarget('https://evil.com/\t')).toBe('/');
    expect(resolveRedirectTarget('/profil\nhttps://evil.com')).toBe('/');
    expect(resolveRedirectTarget('/profil\u00a0x')).toBe('/');
    expect(resolveRedirectTarget('/profil\u0000')).toBe('/');
  });

  it('rejects look-alike admin urls', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', ADMIN_URL);

    expect(resolveRedirectTarget(`${ADMIN_URL}.evil.com`)).toBe('/');
    expect(resolveRedirectTarget('http://localhost:3002')).toBe('/');
  });

  it('keeps admin urls', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', ADMIN_URL);

    expect(resolveRedirectTarget(ADMIN_URL)).toBe(ADMIN_URL);
    expect(resolveRedirectTarget(`${ADMIN_URL}/tableau-de-bord`)).toBe(
      `${ADMIN_URL}/tableau-de-bord`,
    );
  });

  it('keeps admin urls despite a trailing slash in the env var', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', `${ADMIN_URL}/`);

    expect(resolveRedirectTarget(`${ADMIN_URL}/tableau-de-bord`)).toBe(
      `${ADMIN_URL}/tableau-de-bord`,
    );
    expect(resolveRedirectTarget(`${ADMIN_URL}//evil.com`)).toBe(`${ADMIN_URL}//evil.com`);
  });
});
