#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { createApp } from '@server/index';
import { Command } from 'commander';

import pkg from '../package.json';

const program = new Command();

program
  .name('trekker-dashboard')
  .description('Kanban board dashboard for Trekker issue tracker')
  .version(pkg.version)
  .option('-p, --port <port>', 'Port to run on', '3000')
  .action((options) => {
    const cwd = process.cwd();
    const trekkerDir = resolve(cwd, '.trekker');
    const dbPath = resolve(trekkerDir, 'trekker.db');

    if (!existsSync(trekkerDir)) {
      console.error('Error: No .trekker directory found in current directory.');
      console.error("Run 'trekker init' first to initialize the issue tracker.");
      process.exit(1);
    }

    if (!existsSync(dbPath)) {
      console.error('Error: No trekker.db found in .trekker directory.');
      console.error("Run 'trekker init' first to initialize the issue tracker.");
      process.exit(1);
    }

    process.env.TREKKER_DB_PATH = dbPath;

    const port = parseInt(options.port, 10);
    if (Number.isNaN(port) || port <= 0) {
      console.error(`Error: Invalid port: ${options.port}`);
      process.exit(1);
    }

    const app = createApp();
    const server = Bun.serve({
      port,
      fetch: app.fetch,
    });

    console.log(`Starting Trekker Dashboard on http://localhost:${port}`);
    console.log(`Using database: ${dbPath}`);
    console.log('Press Ctrl+C to stop\n');

    const stopServer = () => {
      server.stop(true);
      process.exit(0);
    };

    process.on('SIGINT', stopServer);
    process.on('SIGTERM', stopServer);
  });

program.parse();
