import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ProjectConfig } from '@/lib/types';
import type { Epic, Project, Task } from '@/types';

// Fetch functions
async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

async function fetchEpics(): Promise<Epic[]> {
  const res = await fetch('/api/epics');
  if (!res.ok) throw new Error('Failed to fetch epics');
  return res.json();
}

async function fetchProject(): Promise<Project | null> {
  const res = await fetch('/api/project');
  if (!res.ok) return null;
  return res.json();
}

// Query hooks
function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
}

function useEpics() {
  return useQuery({
    queryKey: ['epics'],
    queryFn: fetchEpics,
  });
}

function useProject() {
  return useQuery({
    queryKey: ['project'],
    queryFn: fetchProject,
  });
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProjectConfig>) => {
      const res = await fetch('/api/project/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update project config');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

// Combined data hook for the main page
export function useAppData() {
  const tasksQuery = useTasks();
  const epicsQuery = useEpics();
  const projectQuery = useProject();

  return {
    tasks: tasksQuery.data ?? [],
    epics: epicsQuery.data ?? [],
    project: projectQuery.data ?? null,
    isLoading: tasksQuery.isLoading || epicsQuery.isLoading,
    error: tasksQuery.error || epicsQuery.error,
    refetch: () => {
      tasksQuery.refetch();
      epicsQuery.refetch();
      projectQuery.refetch();
    },
  };
}

export function useBulkArchiveCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/bulk-archive-completed', {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to archive completed items');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
