import { config } from 'dotenv';
import type { NextConfig } from 'next';

import { BASE_PATH } from './src/basePath';

config({ path: '../../.env' });

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  output: 'standalone',
  reactCompiler: true,
};

export default nextConfig;
