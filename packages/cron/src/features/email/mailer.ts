import { createTransport } from 'nodemailer';

export interface Mail {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: { filename: string; file: Buffer }[];
}

export interface Mailer {
  send: (mail: Mail) => Promise<void> | void;
}

const EMAIL_ENV_VARS = [
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'EMAIL_SERVER_HOST',
  'EMAIL_SERVER_PORT',
  'EMAIL_FROM',
  'EMAIL_REPLY_TO',
] as const;

type EmailEnv = Partial<Record<(typeof EMAIL_ENV_VARS)[number], string>>;

const readEmailEnv = (): EmailEnv =>
  Object.fromEntries(EMAIL_ENV_VARS.map((name) => [name, process.env[name]?.trim() ?? '']));

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const consoleMailer = (): Mailer => ({
  send: (mail) => {
    for (const { filename } of mail.attachments ?? []) {
      console.log(`[email] attachment: ${filename}`);
    }
    console.log(
      `[email] would send to ${mail.to}${mail.cc ? ` (cc: ${mail.cc})` : ''}: ${mail.subject}\n${mail.html}`,
    );
  },
});

const smtpMailer = (env: EmailEnv): Mailer => {
  const port = Number(env.EMAIL_SERVER_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`EMAIL_SERVER_PORT must be a positive integer, got: ${env.EMAIL_SERVER_PORT}`);
  }

  const transport = createTransport({
    host: env.EMAIL_SERVER_HOST,
    port,
    secure: true,
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  });

  return {
    send: async (mail) => {
      await transport.sendMail({
        from: env.EMAIL_FROM,
        replyTo: env.EMAIL_REPLY_TO,
        to: mail.to,
        cc: mail.cc,
        subject: mail.subject,
        html: mail.html,
        attachments: mail.attachments?.map(({ filename, file }) => ({ filename, content: file })),
      });
    },
  };
};

// Either every variable is set (SMTP mode) or none is (development console
// mode); a partial configuration is an operator error.
export const createMailer = (): Mailer => {
  const env = readEmailEnv();

  if (Object.values(env).every((value) => value === '')) {
    return consoleMailer();
  }

  const missing = EMAIL_ENV_VARS.filter((name) => env[name] === '');
  if (missing.length > 0) {
    throw new Error(
      `Missing email environment variables: ${missing.join(', ')}. Set all of them, or none to log e-mails to the console.`,
    );
  }

  return smtpMailer(env);
};

export { errorMessage };
