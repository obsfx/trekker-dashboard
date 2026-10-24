import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { PROJECT_NAME, seedProject } from './support/seed';

const CLIENT_INDEX = resolve(import.meta.dirname, '../../dist/client/index.html');

export default function globalSetup(): () => void {
  if (!existsSync(CLIENT_INDEX)) {
    throw new Error(`Client bundle missing at ${CLIENT_INDEX}. Run "bun run build:client" first.`);
  }

  const templateRoot = mkdtempSync(join(tmpdir(), 'trekker-e2e-template-'));
  const templateProject = join(templateRoot, PROJECT_NAME);
  mkdirSync(templateProject);
  seedProject(templateProject);

  process.env.TREKKER_E2E_TEMPLATE = templateProject;

  return () => {
    rmSync(templateRoot, { recursive: true, force: true });
  };
}
