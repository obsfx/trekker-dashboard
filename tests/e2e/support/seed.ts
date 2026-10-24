import { runTrekker } from './trekker-cli';

export const PROJECT_NAME = 'acme-roadmap';

export const EPICS = {
  auth: {
    id: 'EPIC-1',
    title: 'Authentication overhaul',
    description: 'Replace the legacy **session** auth.\n\n- OAuth providers\n- JWT tokens',
    status: 'in_progress',
    priority: 1,
  },
  reporting: {
    id: 'EPIC-2',
    title: 'Reporting dashboard',
    description: 'Charts and CSV exports',
    status: 'todo',
    priority: 2,
  },
  cleanup: {
    id: 'EPIC-3',
    title: 'Legacy cleanup',
    description: null,
    status: 'completed',
    priority: 3,
  },
} as const;

export const TASKS = {
  loginForm: {
    id: 'TREK-1',
    title: 'Build login form',
    description: 'Login form with **email** and password.\n\n- client validation\n- remember me',
    status: 'in_progress',
    priority: 1,
    tags: 'frontend,auth',
    epicId: EPICS.auth.id,
  },
  jwtRefresh: {
    id: 'TREK-2',
    title: 'Add JWT refresh endpoint',
    description: 'Rotate refresh tokens on every use',
    status: 'todo',
    priority: 0,
    tags: 'backend',
    epicId: EPICS.auth.id,
  },
  authDocs: {
    id: 'TREK-3',
    title: 'Write auth documentation',
    description: null,
    status: 'completed',
    priority: 3,
    tags: 'docs',
    epicId: EPICS.auth.id,
  },
  revenueChart: {
    id: 'TREK-4',
    title: 'Design revenue chart',
    description: null,
    status: 'todo',
    priority: 2,
    tags: null,
    epicId: EPICS.reporting.id,
  },
  dropTables: {
    id: 'TREK-5',
    title: 'Drop unused tables',
    description: null,
    status: 'wont_fix',
    priority: 4,
    tags: null,
    epicId: null,
  },
  cronJobs: {
    id: 'TREK-6',
    title: 'Archive legacy cron jobs',
    description: null,
    status: 'completed',
    priority: 2,
    tags: null,
    epicId: null,
  },
} as const;

export const SUBTASKS = {
  emailValidation: {
    id: 'TREK-7',
    parentId: TASKS.loginForm.id,
    title: 'Email field validation',
    status: 'completed',
    priority: 2,
  },
  passwordMeter: {
    id: 'TREK-8',
    parentId: TASKS.loginForm.id,
    title: 'Password strength meter',
    status: 'todo',
    priority: 2,
  },
} as const;

export const DEPENDENCIES = [{ taskId: TASKS.jwtRefresh.id, dependsOnId: TASKS.loginForm.id }];

export const COMMENTS = {
  layout: {
    id: 'CMT-1',
    taskId: TASKS.loginForm.id,
    author: 'alice',
    content: 'Started on the layout.',
  },
  darkMode: {
    id: 'CMT-2',
    taskId: TASKS.loginForm.id,
    author: 'bob',
    content: 'Remember the dark mode styles.',
  },
} as const;

const ARCHIVED_BACKLOG_COUNT = 40;
const FIRST_BACKLOG_TASK_NUMBER = 9;

export const ARCHIVED_BACKLOG = Array.from({ length: ARCHIVED_BACKLOG_COUNT }, (_, index) => ({
  id: `TREK-${FIRST_BACKLOG_TASK_NUMBER + index}`,
  title: `Backlog item ${String(index + 1).padStart(2, '0')}`,
  status: 'archived',
  priority: 5,
}));

export const TOTAL_EPICS = Object.keys(EPICS).length;
export const TOTAL_TASKS =
  Object.keys(TASKS).length + Object.keys(SUBTASKS).length + ARCHIVED_BACKLOG.length;
export const TOTAL_LIST_ITEMS = TOTAL_EPICS + TOTAL_TASKS;
export const TOTAL_HISTORY_EVENTS =
  TOTAL_LIST_ITEMS + Object.keys(COMMENTS).length + DEPENDENCIES.length;
export const NEXT_TASK_ID = `TREK-${TOTAL_TASKS + 1}`;
export const NEXT_EPIC_ID = `EPIC-${TOTAL_EPICS + 1}`;

function optionalArgs(flag: string, value: string | number | null): string[] {
  if (value === null) {
    return [];
  }

  return [flag, String(value)];
}

function createAndExpectId(cwd: string, args: string[], expectedId: string): void {
  const output = runTrekker(cwd, args);
  const createdId = /(?:created|added): (\S+)/i.exec(output)?.[1];
  if (createdId !== expectedId) {
    throw new Error(
      `Seed drift: expected ${expectedId} but trekker reported ${createdId ?? 'nothing'}\n${output}`
    );
  }
}

export function seedProject(cwd: string): void {
  runTrekker(cwd, ['init']);

  for (const epic of Object.values(EPICS)) {
    createAndExpectId(
      cwd,
      [
        'epic',
        'create',
        '-t',
        epic.title,
        '-s',
        epic.status,
        '-p',
        String(epic.priority),
        ...optionalArgs('-d', epic.description),
      ],
      epic.id
    );
  }

  for (const task of Object.values(TASKS)) {
    createAndExpectId(
      cwd,
      [
        'task',
        'create',
        '-t',
        task.title,
        '-s',
        task.status,
        '-p',
        String(task.priority),
        ...optionalArgs('-d', task.description),
        ...optionalArgs('--tags', task.tags),
        ...optionalArgs('-e', task.epicId),
      ],
      task.id
    );
  }

  for (const subtask of Object.values(SUBTASKS)) {
    createAndExpectId(
      cwd,
      [
        'subtask',
        'create',
        subtask.parentId,
        '-t',
        subtask.title,
        '-s',
        subtask.status,
        '-p',
        String(subtask.priority),
      ],
      subtask.id
    );
  }

  for (const dependency of DEPENDENCIES) {
    runTrekker(cwd, ['dep', 'add', dependency.taskId, dependency.dependsOnId]);
  }

  for (const comment of Object.values(COMMENTS)) {
    createAndExpectId(
      cwd,
      ['comment', 'add', comment.taskId, '-a', comment.author, '-c', comment.content],
      comment.id
    );
  }

  for (const backlogTask of ARCHIVED_BACKLOG) {
    createAndExpectId(
      cwd,
      [
        'task',
        'create',
        '-t',
        backlogTask.title,
        '-s',
        backlogTask.status,
        '-p',
        String(backlogTask.priority),
      ],
      backlogTask.id
    );
  }
}
