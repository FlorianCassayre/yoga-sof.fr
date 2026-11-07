import { config } from 'dotenv';
import type { NextConfig } from 'next';

config({ path: '../../.env' });

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
