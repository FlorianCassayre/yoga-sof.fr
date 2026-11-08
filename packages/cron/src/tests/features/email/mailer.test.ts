import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMailer } from '../../../features/email/mailer';

const EMAIL_ENV_VARS = [
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'EMAIL_SERVER_HOST',
  'EMAIL_SERVER_PORT',
  'EMAIL_FROM',
  'EMAIL_REPLY_TO',
] as const;

const SMTP_ENV: Record<(typeof EMAIL_ENV_VARS)[number], string> = {
  EMAIL_SERVER_USER: 'user',
  EMAIL_SERVER_PASSWORD: 'pass',
  EMAIL_SERVER_HOST: 'smtp.example.com',
  EMAIL_SERVER_PORT: '587',
  EMAIL_FROM: 'from@example.com',
  EMAIL_REPLY_TO: 'reply@example.com',
};

const sendMail = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({ sendMail })),
}));

describe('createMailer', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    sendMail.mockClear();
  });

  it('falls back to console mode when every variable is unset', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const mailer = createMailer();

    await mailer.send({ to: 'a@example.com', subject: 'Sujet', html: '<p>Salut</p>' });

    expect(log).toHaveBeenCalledWith(expect.stringContaining('a@example.com'));
    log.mockRestore();
  });

  it('falls back to console mode when every variable is empty', () => {
    for (const name of EMAIL_ENV_VARS) {
      vi.stubEnv(name, '  ');
    }

    expect(() => createMailer()).not.toThrow();
  });

  it('throws when one variable is missing', () => {
    for (const [name, value] of Object.entries(SMTP_ENV)) {
      vi.stubEnv(name, value);
    }
    vi.stubEnv('EMAIL_SERVER_PASSWORD', '');

    expect(() => createMailer()).toThrow('EMAIL_SERVER_PASSWORD');
  });

  it('throws when the port is not a positive integer', () => {
    for (const [name, value] of Object.entries(SMTP_ENV)) {
      vi.stubEnv(name, value);
    }
    vi.stubEnv('EMAIL_SERVER_PORT', 'smtp');

    expect(() => createMailer()).toThrow('EMAIL_SERVER_PORT');
  });

  it('sends over SMTP when fully configured', async () => {
    for (const [name, value] of Object.entries(SMTP_ENV)) {
      vi.stubEnv(name, value);
    }
    const mailer = createMailer();

    await mailer.send({
      to: 'a@example.com',
      cc: 'b@example.com',
      subject: 'Sujet',
      html: '<p>Salut</p>',
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'from@example.com',
      replyTo: 'reply@example.com',
      to: 'a@example.com',
      cc: 'b@example.com',
      subject: 'Sujet',
      html: '<p>Salut</p>',
    });
  });
});
