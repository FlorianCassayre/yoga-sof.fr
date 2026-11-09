import { config } from 'dotenv';
import type { NextConfig } from 'next';

config({ path: '../../.env' });

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  typedRoutes: true,
  // The e-mail renderer loads react-dom/server at runtime (turbopackIgnore),
  // so the bundler never references the package and standalone tracing skips
  // it — force it (with its runtime deps) into the output.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/{react,react-dom}/**'],
  },
};

export default nextConfig;
