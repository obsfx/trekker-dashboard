'use client';

import { Package, Plus, SlidersHorizontal } from 'lucide-react';

import { NotificationToggle } from '@/components/notification-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import type { ProjectConfig } from '@/types';

interface AppHeaderActionsProps {
  projectConfig?: ProjectConfig;
  projectName?: string;
  onNewClick?: () => void;
  onProjectConfigClick: () => void;
}

export function AppHeaderActions({
  projectConfig,
  projectName,
  onNewClick,
  onProjectConfigClick,
}: AppHeaderActionsProps) {
  const projectNameContent = projectName && (
    <div className="flex items-center gap-1">
      <Package className="text-muted-foreground" width={16} />
      <span className="text-sm text-muted-foreground">{projectName}</span>
    </div>
  );

  const projectConfigButton = projectConfig && (
    <Button size="sm" variant="outline" onClick={onProjectConfigClick}>
      <SlidersHorizontal className="mr-1 h-4 w-4" />
      Prefixes
    </Button>
  );

  const newButton = onNewClick && (
    <Button size="sm" onClick={onNewClick}>
      <Plus className="mr-1 h-4 w-4" />
      New
    </Button>
  );

  return (
    <div className="flex gap-6">
      {projectNameContent}

      <div className="flex items-center gap-2">
        {projectConfigButton}
        {newButton}
        <NotificationToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
