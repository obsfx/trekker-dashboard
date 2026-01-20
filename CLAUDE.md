# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trekker Dashboard is a kanban board web application for the Trekker issue tracker. It connects to a local SQLite database (`.trekker/trekker.db`) and provides real-time task management with Server-Sent Events.

- **Package**: `@obsfx/trekker-dashboard`
- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun (primary), Node.js supported for distribution

## Commands

```bash
# Development
bun run dev                    # Start dev server with turbopack

# Production build
bun run build                  # Build standalone output to .next/standalone

# Run CLI locally
bun run start                  # Runs src/cli.ts

# Release (bumps version, builds, publishes to npm)
bun run release:patch          # Patch release
bun run release:minor          # Minor release
bun run release:major          # Major release
```

## Architecture

### Entry Points

- **CLI**: `bin/trekker-dashboard.js` → `src/cli.ts` - Commander.js CLI that spawns the production server
- **Web App**: `src/app/page.tsx` - Main client-side kanban board component

### Key Directories

- `src/app/api/` - Next.js API routes (tasks, epics, comments, dependencies, events)
- `src/components/` - React components including `ui/` (shadcn/ui) and `kanban/`
- `src/hooks/` - React Query hooks (`use-data.ts`) and SSE subscription (`use-task-events.ts`)
- `src/lib/` - Database setup (`db.ts`), Drizzle schema (`schema.ts`), constants, utilities
- `src/stores/` - Zustand store for UI state (`ui-store.ts`)

### Data Flow

1. **Fetching**: React Query hooks → `/api/*` routes → Drizzle ORM → SQLite
2. **Real-time**: EventSource → `/api/events` SSE endpoint → query invalidation
3. **State**: Zustand for modals/UI, React Query for server state

### Database

SQLite via Drizzle ORM with `bun:sqlite` driver. Tables: projects, epics, tasks, comments, dependencies, idCounters.

ID pattern: `TREK-N` (tasks), `EPIC-N` (epics), `CMT-N` (comments)

### Tech Stack

- **UI**: Tailwind CSS 4, shadcn/ui (new-york style), Radix UI primitives, Lucide icons
- **Data**: React Query, Zustand, Drizzle ORM, Zod validation
- **Forms**: react-hook-form with Zod resolver

## Patterns

- Client components use `"use client"` directive
- API routes return JSON with try-catch error handling
- Path alias: `@/*` maps to `./src/*`
- Next.js standalone output mode for distribution
