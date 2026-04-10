'use client';

import { useState } from 'react';

import {
  buildTaskBreadcrumbItems,
  findEpicById,
  findTaskById,
  getSubtasksForTask,
} from '@/components/task-detail/selectors';
import { TaskEdit } from '@/components/task-detail/task-edit';
import { TaskView } from '@/components/task-detail/task-view';
import { useTaskForm } from '@/components/task-detail/use-task-form';
import type { Epic, Task } from '@/types';

interface TaskDetailModalProps {
  task: Task | null;
  epics: Epic[];
  allTasks: Task[];
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onTaskClick?: (task: Task) => void;
  onEpicClick?: (epic: Epic) => void;
}

export function TaskDetailModal({
  task,
  epics,
  allTasks,
  open,
  onClose,
  onUpdate,
  onTaskClick,
  onEpicClick,
}: TaskDetailModalProps) {
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
  } = useTaskForm({ task, open, isEditing, onClose, onUpdate });

  const getEpicById = (id: string) => findEpicById(epics, id);
  const getTaskById = (id: string) => findTaskById(allTasks, id);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!task) return null;

  const subtasks = getSubtasksForTask(allTasks, task.id);
  const breadcrumbItems = buildTaskBreadcrumbItems(epics, allTasks, {
    onEpicClick,
    onTaskClick,
    task,
  });
  const status = form.watch('status');
  const priority = form.watch('priority');

  const handleEditCancel = () => {
    handleCancel();
    setIsEditing(false);
  };

  return (
    <>
      <TaskView
        task={task}
        subtasks={subtasks}
        breadcrumbItems={breadcrumbItems}
        status={status}
        priority={priority}
        open={open && !isEditing}
        onClose={handleClose}
        onEdit={() => setIsEditing(true)}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onTaskClick={onTaskClick}
        onEpicClick={onEpicClick}
        getEpicById={getEpicById}
        getTaskById={getTaskById}
      />

      <TaskEdit
        form={form}
        epics={epics}
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
