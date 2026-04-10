'use client';

import { useState } from 'react';

import { EpicEdit } from '@/components/epic-detail/epic-edit';
import { EpicView } from '@/components/epic-detail/epic-view';
import { buildEpicBreadcrumbItems } from '@/components/epic-detail/selectors';
import { useEpicForm } from '@/components/epic-detail/use-epic-form';
import type { Epic, Task } from '@/types';

interface EpicDetailModalProps {
  epic: Epic | null;
  tasks?: Task[];
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onTaskClick?: (task: Task) => void;
}

export function EpicDetailModal({
  epic,
  tasks = [],
  open,
  onClose,
  onUpdate,
  onTaskClick,
}: EpicDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    form,
    isDeleting,
    setIsDeleting,
    handleSave,
    handleDelete,
    handleCancel,
    handleStatusChange,
    handlePriorityChange,
  } = useEpicForm({ epic, open, isEditing, onClose, onUpdate });

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!epic) return null;

  const breadcrumbItems = buildEpicBreadcrumbItems(epic);

  const status = form.watch('status');
  const priority = form.watch('priority');

  const handleEditCancel = () => {
    handleCancel();
    setIsEditing(false);
  };

  return (
    <>
      <EpicView
        epic={epic}
        tasks={tasks}
        breadcrumbItems={breadcrumbItems}
        status={status}
        priority={priority}
        open={open && !isEditing}
        onClose={handleClose}
        onEdit={() => setIsEditing(true)}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onTaskClick={onTaskClick}
      />

      <EpicEdit
        form={form}
        breadcrumbItems={breadcrumbItems}
        open={open && isEditing}
        isDeleting={isDeleting}
        onClose={handleClose}
        onSubmit={handleSave}
        onCancel={handleEditCancel}
        onDelete={() => setIsDeleting(true)}
        onDeleteConfirm={handleDelete}
        onDeleteCancel={() => setIsDeleting(false)}
      />
    </>
  );
}
