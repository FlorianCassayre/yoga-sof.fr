import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  adminRedirectRoot,
  isAdminRedirectTarget,
  resolveRedirectTarget,
} from '../../../features/auth/redirectTarget';

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

describe('isAdminRedirectTarget', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('matches the admin url and its subpaths', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', ADMIN_URL);

    expect(isAdminRedirectTarget(ADMIN_URL)).toBe(true);
    expect(isAdminRedirectTarget(`${ADMIN_URL}/roles`)).toBe(true);
    expect(isAdminRedirectTarget(`${ADMIN_URL}/roles?onglet=x`)).toBe(true);
  });

  it('rejects everything else', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', ADMIN_URL);

    expect(isAdminRedirectTarget('/')).toBe(false);
    expect(isAdminRedirectTarget('/profil')).toBe(false);
    expect(isAdminRedirectTarget(`${ADMIN_URL}.evil.com`)).toBe(false);
  });

  it('normalizes a trailing slash in the env var', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', `${ADMIN_URL}/`);

    expect(isAdminRedirectTarget(ADMIN_URL)).toBe(true);
    expect(isAdminRedirectTarget(`${ADMIN_URL}/roles`)).toBe(true);
  });

  it('is false without the env var', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', '');

    expect(isAdminRedirectTarget(ADMIN_URL)).toBe(false);
  });
});

describe('adminRedirectRoot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the admin url without a trailing slash', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', `${ADMIN_URL}/`);

    expect(adminRedirectRoot()).toBe(ADMIN_URL);
  });

  it('falls back to / without the env var', () => {
    vi.stubEnv('NEXT_ADMIN_SITE_URL', '');

    expect(adminRedirectRoot()).toBe('/');
  });
});
