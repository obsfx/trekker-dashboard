#!/usr/bin/env bun
import { Command } from "commander";
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { existsSync } from "fs";
import pkg from "../package.json";

const program = new Command();

program
  .name("trekker-dashboard")
  .description("Kanban board dashboard for Trekker issue tracker")
  .version(pkg.version)
  .option("-p, --port <port>", "Port to run on", "3000")
  .action(async (options) => {
    const cwd = process.cwd();
    const trekkerDir = resolve(cwd, ".trekker");
    const dbPath = resolve(trekkerDir, "trekker.db");

    // Check if .trekker directory exists
    if (!existsSync(trekkerDir)) {
      console.error("Error: No .trekker directory found in current directory.");
      console.error("Run 'trekker init' first to initialize the issue tracker.");
      process.exit(1);
    }

    // Check if database exists
    if (!existsSync(dbPath)) {
      console.error("Error: No trekker.db found in .trekker directory.");
      console.error("Run 'trekker init' first to initialize the issue tracker.");
      process.exit(1);
    }

    const env = {
      ...process.env,
      TREKKER_DB_PATH: dbPath,
      PORT: options.port,
    };

    console.log(`Starting Trekker Dashboard on http://localhost:${options.port}`);
    console.log(`Using database: ${dbPath}`);
    console.log("Press Ctrl+C to stop\n");

    // Find the webapp directory
    const scriptDir = dirname(import.meta.url.replace("file://", ""));

    // Check for standalone build first (production)
    const standaloneDir = resolve(scriptDir, "..", ".next", "standalone");
    if (existsSync(resolve(standaloneDir, "server.js"))) {
      const server = spawn("bun", ["run", "server.js"], {
        cwd: standaloneDir,
        stdio: "inherit",
        env,
      });
      setupSignalHandlers(server);
      return;
    }

    // Development mode - run next dev
    const rootDir = resolve(scriptDir, "..");
    if (!existsSync(resolve(rootDir, "node_modules"))) {
      console.log("Installing dependencies...");
      const install = spawn("bun", ["install"], {
        cwd: rootDir,
        stdio: "inherit",
      });
      await new Promise<void>((resolve, reject) => {
        install.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`bun install failed with code ${code}`));
        });
      });
    }

    const dev = spawn("bun", ["--bun", "next", "dev", "-p", options.port], {
      cwd: rootDir,
      stdio: "inherit",
      env,
    });
    setupSignalHandlers(dev);
  });

function setupSignalHandlers(child: ReturnType<typeof spawn>) {
  child.on("error", (err) => {
    console.error(`Failed to start dashboard: ${err.message}`);
    process.exit(1);
  });
  process.on("SIGINT", () => {
    child.kill("SIGINT");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
    process.exit(0);
  });
}

program.parse();
