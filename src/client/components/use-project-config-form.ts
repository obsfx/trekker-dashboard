'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useUpdateProjectConfig } from '@/hooks/use-data';
import { getErrorMessage } from '@/lib/errors';
import type { ProjectConfig } from '@/types';

interface ProjectConfigDialogStateOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectConfig?: ProjectConfig;
}

interface ProjectConfigFormState {
  issuePrefix: string;
  epicPrefix: string;
  commentPrefix: string;
}

const EMPTY_FORM: ProjectConfigFormState = {
  issuePrefix: '',
  epicPrefix: '',
  commentPrefix: '',
};

function getInitialForm(projectConfig?: ProjectConfig): ProjectConfigFormState {
  if (!projectConfig) {
    return EMPTY_FORM;
  }

  return {
    issuePrefix: projectConfig.issuePrefix,
    epicPrefix: projectConfig.epicPrefix,
    commentPrefix: projectConfig.commentPrefix,
  };
}

export function useProjectConfigForm({
  open,
  onOpenChange,
  projectConfig,
}: ProjectConfigDialogStateOptions) {
  const [form, setForm] = useState<ProjectConfigFormState>(() => getInitialForm(projectConfig));
  const updateProjectConfig = useUpdateProjectConfig();

  useEffect(() => {
    setForm(getInitialForm(projectConfig));
  }, [open, projectConfig]);

  function handleFieldChange(field: keyof ProjectConfigFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateProjectConfig.mutateAsync(form);
      toast.success('Project prefixes updated');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update prefixes'));
    }
  }

  return {
    form,
    handleFieldChange,
    handleSubmit,
    isPending: updateProjectConfig.isPending,
  };
}
