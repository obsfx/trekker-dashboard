#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

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
if (!process.versions.bun) {
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
  const cliPath = resolve(__dirname, '..', 'dist', 'server', 'cli.js');
  if (!existsSync(cliPath)) {
    console.error('Error: CLI bundle not found at', cliPath);
    console.error('The package may not have been built correctly.');
    process.exit(1);
  }

  await import(cliPath);
}
