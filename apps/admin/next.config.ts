import { config } from 'dotenv';
import type { NextConfig } from 'next';

config({ path: '../../.env' });

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_ADMIN_SITE_BASE_PATH ?? undefined,
  env: {
    NEXT_ADMIN_SITE_BASE_PATH: process.env.NEXT_ADMIN_SITE_BASE_PATH ?? '',
  },
  reactCompiler: true,
};

export default nextConfig;
