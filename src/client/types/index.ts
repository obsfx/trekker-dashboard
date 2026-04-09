import type { ProjectConfig } from '@/lib/types';

export type { ProjectConfig } from '@/lib/types';

// Webapp-specific types (dates as strings from JSON API)
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  config: ProjectConfig;
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  epicId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  priority: number;
  status: string;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined from dependencies table
  dependsOn: string[];
  blocks: string[];
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateType = 'epic' | 'task' | 'subtask';

export interface CreateModalDefaults {
  status?: string;
  type?: CreateType;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
