# Trekker Dashboard

![Trekker Dashboard](https://omercan.io/trekker/images/dashboard-kanban.png)

![Trekker Dashboard](https://omercan.io/trekker/images/dashboard-epic.png)

A kanban board dashboard for [Trekker](https://github.com/obsfx/trekker) issue tracker. Provides a visual interface for managing tasks, epics, and dependencies stored in the local SQLite database.

## Install

```bash
bun install -g @obsfx/trekker-dashboard
```

Or with npm (still requires Bun runtime to run):

```bash
npm install -g @obsfx/trekker-dashboard
```

## Usage

Navigate to a directory with a `.trekker` database and start the dashboard:

```bash
cd your-project
trekker-dashboard
```

Options:

```bash
trekker-dashboard -p 8080    # Start on custom port (default: 3000)
trekker-dashboard --help     # Show help
```

## Requirements

- **Bun runtime** (required) - The dashboard uses Bun's native SQLite driver
- A project initialized with Trekker (`trekker init`)

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Homebrew
brew install oven-sh/bun/bun

# Windows (scoop)
scoop install bun

# npm (any platform)
npm install -g bun
```

See [bun.sh/docs/installation](https://bun.sh/docs/installation) for more options.

## Features

- Kanban board with tasks grouped by status (TODO, In Progress, Completed)
- Epic filtering to focus on specific features
- Task details including dependencies, subtasks, and tags
- Create, edit, and delete tasks directly from the UI
- Real-time updates via Server-Sent Events
- Dark mode support

## How It Works

The dashboard connects to the same `.trekker/trekker.db` SQLite database used by the Trekker CLI. Any changes made in the dashboard are immediately visible in the CLI and vice versa.

## Related

- [Trekker CLI](https://github.com/obsfx/trekker) - The main CLI tool for issue tracking

## License

MIT
