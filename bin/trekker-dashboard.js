#!/usr/bin/env node
import { Command } from "commander";
import { resolve, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name("trekker-dashboard")
  .description("Kanban board dashboard for Trekker issue tracker")
  .version("1.0.4")
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

    // Set environment variables
    process.env.TREKKER_DB_PATH = dbPath;
    process.env.PORT = options.port;

    console.log(`Starting Trekker Dashboard on http://localhost:${options.port}`);
    console.log(`Using database: ${dbPath}`);
    console.log("Press Ctrl+C to stop\n");

    // Import and start the server
    const serverPath = resolve(__dirname, "..", "dist", "server", "index.js");
    if (!existsSync(serverPath)) {
      console.error("Error: Server bundle not found at", serverPath);
      console.error("The package may not have been built correctly.");
      process.exit(1);
    }

    await import(serverPath);
  });

program.parse();
