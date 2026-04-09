'use client';

import { GitBranchPlus } from 'lucide-react';
import { useState } from 'react';

import { AppHeaderActions } from '@/components/app-header-actions';
import { AppNavigation } from '@/components/app-navigation';
import { ProjectConfigDialog } from '@/components/project-config-dialog';
import type { ProjectConfig } from '@/types';

interface AppHeaderProps {
  projectName?: string;
  projectConfig?: ProjectConfig;
  onNewClick?: () => void;
}

export function AppHeader({ projectName, projectConfig, onNewClick }: AppHeaderProps) {
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b px-4 py-2 bg-accent/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <GitBranchPlus />
            <h1 className="text-lg font-bold">trekker</h1>
          </div>

          <AppNavigation />
        </div>

        <AppHeaderActions
          projectName={projectName}
          projectConfig={projectConfig}
          onNewClick={onNewClick}
          onProjectConfigClick={() => setShowConfigDialog(true)}
        />
      </header>

      <ProjectConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        projectName={projectName}
        projectConfig={projectConfig}
      />
    </>
  );
}
