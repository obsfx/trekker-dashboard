'use client';

import { History, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { CommentSection } from '@/components/comment-section';
import { Metadata } from '@/components/shared';
import { HistoryTab } from '@/components/task-detail/history-tab';
import { DetailsSection, LinksSection, SubtasksSection } from '@/components/task-detail/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Epic, Task } from '@/types';

interface TaskSidebarProps {
  task: Task;
  subtasks: Task[];
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onTaskClick?: (task: Task) => void;
  onEpicClick?: (epic: Epic) => void;
  getEpicById: (id: string) => Epic | undefined;
  getTaskById: (id: string) => Task | undefined;
}

type TabType = 'comments' | 'history';

export function TaskSidebar({
  task,
  subtasks,
  onStatusChange,
  onPriorityChange,
  onTaskClick,
  onEpicClick,
  getEpicById,
  getTaskById,
}: TaskSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  let tabContent = <HistoryTab taskId={task.id} />;
  if (activeTab === 'comments') {
    tabContent = <CommentSection taskId={task.id} />;
  }

  return (
    <div className="bg-muted/50 rounded-b-md">
      <div className="p-4 space-y-6">
        <DetailsSection
          task={task}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onEpicClick={onEpicClick}
          getEpicById={getEpicById}
        />

        <LinksSection
          dependsOn={task.dependsOn}
          blocks={task.blocks}
          onTaskClick={onTaskClick}
          getTaskById={getTaskById}
        />

        <SubtasksSection subtasks={subtasks} onTaskClick={onTaskClick} />
        <Metadata createdAt={task.createdAt} updatedAt={task.updatedAt} />
      </div>

      <div className="border-t">
        <div className="flex border-b">
          <Button
            variant="ghost"
            size="sm"
            className={cn('flex-1 rounded-none', activeTab === 'comments' && 'bg-accent')}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Comments
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('flex-1 rounded-none', activeTab === 'history' && 'bg-accent')}
            onClick={() => setActiveTab('history')}
          >
            <History className="h-4 w-4 mr-1.5" />
            History
          </Button>
        </div>

        {tabContent}
      </div>
    </div>
  );
}
