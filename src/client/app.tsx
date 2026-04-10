import { Route, Routes, useLocation } from 'react-router-dom';

import { APP_ROUTES } from '@/app-routes';
import { AppHeader } from '@/components/app-header';
import { CreateModal } from '@/components/create-modal';
import { ConnectionIndicator } from '@/components/shared/connection-indicator';
import { useAppData } from '@/hooks/use-data';
import { useUIStore } from '@/stores';

export function App() {
  const location = useLocation();
  const { tasks, epics, project, refetch } = useAppData();
  const {
    connectionStatus,
    showCreateModal,
    createModalDefaults,
    openCreateModal,
    closeCreateModal,
  } = useUIStore();
  const showConnectionIndicator = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        projectName={project?.name}
        projectConfig={project?.config}
        onNewClick={() => openCreateModal({ status: 'todo' })}
      />

      <Routes>
        {APP_ROUTES.map(({ Page, path }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
      </Routes>

      <footer className="px-4 py-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {tasks.length} tasks across {epics.length} epics
          </span>
          {showConnectionIndicator && <ConnectionIndicator status={connectionStatus} />}
        </div>
      </footer>

      <CreateModal
        open={showCreateModal}
        onClose={closeCreateModal}
        onCreated={refetch}
        epics={epics}
        tasks={tasks}
        defaultStatus={createModalDefaults.status || 'todo'}
      />
    </div>
  );
}
