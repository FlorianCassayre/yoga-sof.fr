import { config } from 'dotenv';
import type { NextConfig } from 'next';

config({ path: '../../.env' });

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
