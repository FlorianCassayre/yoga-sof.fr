import { execSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync } from 'node:fs';

const OUT = 'build/seed';

const version = (name: string) =>
  (
    JSON.parse(readFileSync(`packages/core/node_modules/${name}/package.json`, 'utf8')) as {
      version: string;
    }
  ).version;

rmSync(OUT, { recursive: true, force: true });

execSync(
  'pnpm -F @yoga-sof/seed exec esbuild src/truncate.ts src/seed.ts --bundle --platform=node --format=cjs --target=node26 --outdir=../../build/seed --out-extension:.js=.cjs',
  { stdio: 'inherit' },
);

const dependencies = ['drizzle-kit', 'drizzle-orm', 'pg', 'dotenv']
  .map((name) => `${name}@${version(name)}`)
  .join(' ');

execSync(`npm i --prefix ${OUT} --no-audit --no-fund --silent ${dependencies}`, {
  stdio: 'inherit',
});

cpSync('packages/core/drizzle', `${OUT}/drizzle`, { recursive: true });
cpSync('packages/core/drizzle.config.ts', `${OUT}/drizzle.config.ts`);
