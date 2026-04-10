#!/usr/bin/env node
import { Command } from 'commander';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if bun is installed
function checkBunInstalled() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Show installation instructions and exit
function showBunInstallGuide() {
  console.error('Error: Bun runtime is required but not installed.\n');
  console.error('Trekker Dashboard requires Bun for its SQLite driver.\n');
  console.error('Install Bun:');
  console.error('  curl -fsSL https://bun.sh/install | bash\n');
  console.error('Or via package managers:');
  console.error('  brew install oven-sh/bun/bun      # macOS/Linux');
  console.error('  scoop install bun                 # Windows');
  console.error('  npm install -g bun                # npm\n');
  console.error('Learn more: https://bun.sh/docs/installation');
  process.exit(1);
}

// If not running under bun, check and re-execute with bun
if (typeof Bun === 'undefined') {
  if (!checkBunInstalled()) {
    showBunInstallGuide();
  }
  // Re-execute this script with bun
  const child = spawn('bun', [__filename, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
  child.on('close', (code) => process.exit(code ?? 0));
  child.on('error', () => {
    showBunInstallGuide();
  });
} else {
  // Running under bun, proceed with the CLI
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

  const program = new Command();

  program
    .name('trekker-dashboard')
    .description('Kanban board dashboard for Trekker issue tracker')
    .version(pkg.version)
    .option('-p, --port <port>', 'Port to run on', '3000')
    .action(async (options) => {
      const cwd = process.cwd();
      const trekkerDir = resolve(cwd, '.trekker');
      const dbPath = resolve(trekkerDir, 'trekker.db');
      const port = parseInt(options.port, 10);

      // Check if .trekker directory exists
      if (!existsSync(trekkerDir)) {
        console.error('Error: No .trekker directory found in current directory.');
        console.error("Run 'trekker init' first to initialize the issue tracker.");
        process.exit(1);
      }

      // Check if database exists
      if (!existsSync(dbPath)) {
        console.error('Error: No trekker.db found in .trekker directory.');
        console.error("Run 'trekker init' first to initialize the issue tracker.");
        process.exit(1);
      }

      if (Number.isNaN(port) || port <= 0) {
        console.error(`Error: Invalid port: ${options.port}`);
        process.exit(1);
      }

      // Import the production server bundle and start it explicitly.
      const serverPath = resolve(__dirname, '..', 'dist', 'server', 'index.js');
      if (!existsSync(serverPath)) {
        console.error('Error: Server bundle not found at', serverPath);
        console.error('The package may not have been built correctly.');
        process.exit(1);
      }

      process.env.TREKKER_DB_PATH = dbPath;

      const { createApp } = await import(serverPath);
      if (typeof createApp !== 'function') {
        console.error('Error: Server bundle does not export createApp.');
        console.error('The package may not have been built correctly.');
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
}
