import { getDb, tasks, epics } from "../lib/db";

// Note: This is a polling-based SSE implementation with global state.
// Not suitable for multi-instance deployments.

interface TaskSnapshot {
  id: string;
  status: string;
  title: string;
  updatedAt: Date;
}

interface EpicSnapshot {
  id: string;
  status: string;
  title: string;
  updatedAt: Date;
}

export type SSEEvent =
  | { type: "task_created"; taskId: string; taskTitle: string; status: string }
  | { type: "task_updated"; taskId: string; taskTitle: string; status: string }
  | { type: "task_deleted"; taskId: string; taskTitle: string }
  | { type: "epic_created"; epicId: string; epicTitle: string; status: string }
  | { type: "epic_updated"; epicId: string; epicTitle: string; status: string }
  | { type: "epic_deleted"; epicId: string; epicTitle: string };

let lastTaskState = new Map<string, TaskSnapshot>();
let lastEpicState = new Map<string, EpicSnapshot>();

export async function initialize(): Promise<void> {
  if (lastTaskState.size > 0 || lastEpicState.size > 0) {
    return;
  }

  try {
    const db = getDb();
    const [currentTasks, currentEpics] = await Promise.all([
      db.select().from(tasks),
      db.select().from(epics),
    ]);

    for (const task of currentTasks) {
      lastTaskState.set(task.id, {
        id: task.id,
        status: task.status,
        title: task.title,
        updatedAt: task.updatedAt,
      });
    }

    for (const epic of currentEpics) {
      lastEpicState.set(epic.id, {
        id: epic.id,
        status: epic.status,
        title: epic.title,
        updatedAt: epic.updatedAt,
      });
    }
  } catch {
    // DB might not be ready yet
  }
}

export async function getChanges(): Promise<SSEEvent[]> {
  const db = getDb();
  const [currentTasks, currentEpics] = await Promise.all([
    db.select().from(tasks),
    db.select().from(epics),
  ]);

  const events: SSEEvent[] = [];

  // Track task changes
  const currentTaskIds = new Set<string>();
  for (const task of currentTasks) {
    currentTaskIds.add(task.id);
    const previous = lastTaskState.get(task.id);

    if (!previous) {
      events.push({
        type: "task_created",
        taskId: task.id,
        taskTitle: task.title,
        status: task.status,
      });
    } else if (previous.updatedAt.getTime() !== task.updatedAt.getTime()) {
      events.push({
        type: "task_updated",
        taskId: task.id,
        taskTitle: task.title,
        status: task.status,
      });
    }
  }

  for (const [id, task] of lastTaskState) {
    if (!currentTaskIds.has(id)) {
      events.push({
        type: "task_deleted",
        taskId: id,
        taskTitle: task.title,
      });
    }
  }

  // Track epic changes
  const currentEpicIds = new Set<string>();
  for (const epic of currentEpics) {
    currentEpicIds.add(epic.id);
    const previous = lastEpicState.get(epic.id);

    if (!previous) {
      events.push({
        type: "epic_created",
        epicId: epic.id,
        epicTitle: epic.title,
        status: epic.status,
      });
    } else if (previous.updatedAt.getTime() !== epic.updatedAt.getTime()) {
      events.push({
        type: "epic_updated",
        epicId: epic.id,
        epicTitle: epic.title,
        status: epic.status,
      });
    }
  }

  for (const [id, epic] of lastEpicState) {
    if (!currentEpicIds.has(id)) {
      events.push({
        type: "epic_deleted",
        epicId: id,
        epicTitle: epic.title,
      });
    }
  }

  // Update state
  lastTaskState.clear();
  for (const task of currentTasks) {
    lastTaskState.set(task.id, {
      id: task.id,
      status: task.status,
      title: task.title,
      updatedAt: task.updatedAt,
    });
  }

  lastEpicState.clear();
  for (const epic of currentEpics) {
    lastEpicState.set(epic.id, {
      id: epic.id,
      status: epic.status,
      title: epic.title,
      updatedAt: epic.updatedAt,
    });
  }

  return events;
}
