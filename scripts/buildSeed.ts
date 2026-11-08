import { execSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';

const OUT = 'build/seed';

rmSync(OUT, { recursive: true, force: true });

execSync(
  'pnpm -F @yoga-sof/core exec esbuild src/migrate.ts --bundle --platform=node --format=cjs --target=node26 --outdir=../../build/seed --out-extension:.js=.cjs',
  { stdio: 'inherit' },
);

execSync(
  'pnpm -F @yoga-sof/seed exec esbuild src/truncate.ts src/seed.ts --bundle --platform=node --format=cjs --target=node26 --outdir=../../build/seed --out-extension:.js=.cjs',
  { stdio: 'inherit' },
);

execSync(
  'pnpm -F @yoga-sof/import exec esbuild src/import/index.ts --bundle --platform=node --format=cjs --target=node26 --outdir=../../build/seed --out-extension:.js=.cjs',
  { stdio: 'inherit' },
);

cpSync('packages/core/drizzle', `${OUT}/drizzle`, { recursive: true });
