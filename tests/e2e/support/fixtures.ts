import { type ChildProcess, spawn } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { test as base } from '@playwright/test';

import { PROJECT_NAME } from './seed';
import { runTrekker } from './trekker-cli';

const CLI_ENTRY = resolve(import.meta.dirname, '../../../src/cli.ts');
const BASE_PORT = 4300;
const SERVER_READY_TIMEOUT_MS = 15_000;
const SERVER_POLL_INTERVAL_MS = 100;

export interface TrekkerProject {
  dir: string;
  baseURL: string;
  trekker: (args: string[]) => string;
}

function getTemplateDir(): string {
  const templateDir = process.env.TREKKER_E2E_TEMPLATE;
  if (!templateDir) {
    throw new Error('TREKKER_E2E_TEMPLATE is not set; global setup did not run.');
  }

  return templateDir;
}

function copyTemplateProject(): { root: string; dir: string } {
  const root = mkdtempSync(join(tmpdir(), 'trekker-e2e-'));
  const dir = join(root, PROJECT_NAME);
  cpSync(getTemplateDir(), dir, { recursive: true });
  return { root, dir };
}

async function waitForServer(baseURL: string, server: ChildProcess, logs: string[]) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Dashboard server exited early:\n${logs.join('')}`);
    }

    const isReady = await fetch(`${baseURL}/api/project`).then(
      (response) => response.ok,
      () => false
    );
    if (isReady) {
      return;
    }

    await new Promise((done) => setTimeout(done, SERVER_POLL_INTERVAL_MS));
  }

  throw new Error(`Dashboard server did not become ready:\n${logs.join('')}`);
}

async function stopServer(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null) {
    return;
  }

  const exited = new Promise((done) => server.once('exit', done));
  server.kill('SIGTERM');
  await exited;
}

export const test = base.extend<{ project: TrekkerProject }>({
  project: async ({}, use, testInfo) => {
    const { root, dir } = copyTemplateProject();
    const port = BASE_PORT + testInfo.parallelIndex;
    const baseURL = `http://127.0.0.1:${port}`;
    const logs: string[] = [];

    const server = spawn('bun', [CLI_ENTRY, '--port', String(port)], {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.stdout.on('data', (chunk: Buffer) => logs.push(chunk.toString()));
    server.stderr.on('data', (chunk: Buffer) => logs.push(chunk.toString()));

    try {
      await waitForServer(baseURL, server, logs);
      await use({
        dir,
        baseURL,
        trekker: (args) => runTrekker(dir, args),
      });
    } finally {
      await stopServer(server);
      rmSync(root, { recursive: true, force: true });
    }
  },

  baseURL: async ({ project }, use) => {
    await use(project.baseURL);
  },
});

export { expect } from '@playwright/test';
