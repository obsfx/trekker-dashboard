// Status types
export const TASK_STATUSES = ['todo', 'in_progress', 'completed', 'wont_fix', 'archived'] as const;

export const EPIC_STATUSES = ['todo', 'in_progress', 'completed', 'archived'] as const;

export interface ProjectConfig {
  issuePrefix: string;
  epicPrefix: string;
  commentPrefix: string;
}
