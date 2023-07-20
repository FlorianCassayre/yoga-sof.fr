declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;

      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_HOST: string;
      DATABASE_NAME: string;
      DATABASE_URL: string;

      NEXTAUTH_SECRET: string;

      EMAIL_SERVER_USER: string;
      EMAIL_SERVER_PASSWORD: string;
      EMAIL_SERVER_HOST: string;
      EMAIL_SERVER_PORT: string;
      EMAIL_FROM: string;
      EMAIL_REPLY_TO: string;

      GOOGLE_ID: string;
      GOOGLE_SECRET: string;

      FACEBOOK_ID: string;
      FACEBOOK_SECRET: string;

      UPDATE_TOKEN: string;
      CRON_TOKEN: string;

      SEED_EMAILS_ADMIN?: string;
    }
  }
}

export {};
