// Status types
export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "completed",
  "wont_fix",
  "archived",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const EPIC_STATUSES = [
  "todo",
  "in_progress",
  "completed",
  "archived",
] as const;

export type EpicStatus = (typeof EPIC_STATUSES)[number];

// Priority type (0-5, where 0 is highest priority)
export type Priority = 0 | 1 | 2 | 3 | 4 | 5;

// ID generation types
export type EntityType = "task" | "epic" | "comment";

export const PREFIX_MAP: Record<EntityType, string> = {
  task: "TREK",
  epic: "EPIC",
  comment: "CMT",
};
