// Status types
export const TASK_STATUSES = ['todo', 'in_progress', 'completed', 'wont_fix', 'archived'] as const;

export const EPIC_STATUSES = ['todo', 'in_progress', 'completed', 'archived'] as const;

export const PROJECT_CONFIG_KEYS = ['issue_prefix', 'epic_prefix', 'comment_prefix'] as const;

export type ProjectConfigKey = (typeof PROJECT_CONFIG_KEYS)[number];

export type ProjectConfig = Record<ProjectConfigKey, string>;

export const PROJECT_CONFIG_DEFAULTS: ProjectConfig = {
  issue_prefix: 'TREK',
  epic_prefix: 'EPIC',
  comment_prefix: 'CMT',
};

// ID generation types
export type EntityType = 'task' | 'epic' | 'comment';

export const ENTITY_CONFIG_KEY_MAP: Record<EntityType, ProjectConfigKey> = {
  task: 'issue_prefix',
  epic: 'epic_prefix',
  comment: 'comment_prefix',
};
