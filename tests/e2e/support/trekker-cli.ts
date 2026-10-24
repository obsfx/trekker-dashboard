import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const TREKKER_BIN = resolve(import.meta.dirname, '../../../node_modules/.bin/trekker');

export function runTrekker(cwd: string, args: string[]): string {
  const result = spawnSync(TREKKER_BIN, args, {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1' },
  });

  if (result.status !== 0) {
    throw new Error(`trekker ${args.join(' ')} failed:\n${result.stderr}${result.stdout}`);
  }

  return result.stdout;
}
