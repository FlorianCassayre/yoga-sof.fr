import { describe, expect, it } from 'vitest';

import { authAdapter } from '../../../features/auth/authAdapter';

describe('authAdapter', () => {
  it('implements the Auth.js adapter surface', () => {
    expect(typeof authAdapter.createUser).toBe('function');
    expect(typeof authAdapter.getUser).toBe('function');
    expect(typeof authAdapter.getUserByEmail).toBe('function');
    expect(typeof authAdapter.getUserByAccount).toBe('function');
    expect(typeof authAdapter.updateUser).toBe('function');
    expect(typeof authAdapter.deleteUser).toBe('function');
    expect(typeof authAdapter.linkAccount).toBe('function');
    expect(typeof authAdapter.createSession).toBe('function');
    expect(typeof authAdapter.getSessionAndUser).toBe('function');
    expect(typeof authAdapter.updateSession).toBe('function');
    expect(typeof authAdapter.deleteSession).toBe('function');
    expect(typeof authAdapter.createVerificationToken).toBe('function');
    expect(typeof authAdapter.useVerificationToken).toBe('function');
  });
});
