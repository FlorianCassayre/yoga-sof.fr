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

execSync(
  // node-cron's ESM build reads import.meta.url at load time, which esbuild
  // leaves undefined in a CJS bundle; the define points it at the runtime
  // location inside the image.
  'pnpm -F @yoga-sof/cron exec esbuild src/cron.ts --bundle --platform=node --format=cjs --target=node26 --define:import.meta.url="\'file:///seed/cron.cjs\'" --outdir=../../build/seed --out-extension:.js=.cjs',
  { stdio: 'inherit' },
);

cpSync('packages/core/drizzle', `${OUT}/drizzle`, { recursive: true });
