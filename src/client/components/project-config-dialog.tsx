'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjectConfigForm } from '@/components/use-project-config-form';
import type { ProjectConfig } from '@/types';

interface ProjectConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
  projectConfig?: ProjectConfig;
}

export function ProjectConfigDialog({
  open,
  onOpenChange,
  projectName,
  projectConfig,
}: ProjectConfigDialogProps) {
  const { form, handleFieldChange, handleSubmit, isPending } = useProjectConfigForm({
    open,
    onOpenChange,
    projectConfig,
  });

  let descriptionPrefix = '';
  if (projectName) {
    descriptionPrefix = `${projectName}: `;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ID Prefixes</DialogTitle>
          <DialogDescription>
            {descriptionPrefix}
            Update task, epic, and comment prefixes. Changes affect only newly created IDs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-prefix">Issue prefix</Label>
            <Input
              id="issue-prefix"
              value={form.issuePrefix}
              onChange={(event) => handleFieldChange('issuePrefix', event.target.value)}
              placeholder="TREK"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="epic-prefix">Epic prefix</Label>
            <Input
              id="epic-prefix"
              value={form.epicPrefix}
              onChange={(event) => handleFieldChange('epicPrefix', event.target.value)}
              placeholder="EPIC"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment-prefix">Comment prefix</Label>
            <Input
              id="comment-prefix"
              value={form.commentPrefix}
              onChange={(event) => handleFieldChange('commentPrefix', event.target.value)}
              placeholder="CMT"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !projectConfig}
              loading={isPending}
              loadingText="Saving"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
