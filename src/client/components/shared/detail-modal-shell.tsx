'use client';

import { Pencil } from 'lucide-react';

import type { BreadcrumbItem } from '@/components/breadcrumb';
import { Breadcrumb } from '@/components/breadcrumb';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DetailModalShellProps {
  open: boolean;
  onClose: () => void;
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  description: string | null;
  onEdit: () => void;
  children: React.ReactNode;
}

export function DetailModalShell({
  open,
  onClose,
  breadcrumbItems,
  title,
  description,
  onEdit,
  children,
}: DetailModalShellProps) {
  let descriptionContent = <p className="text-sm text-muted-foreground italic">No description</p>;
  if (description) {
    descriptionContent = <MarkdownRenderer content={description} />;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="flex flex-col min-w-0">
            <div className="px-4 pt-4 pb-2 flex justify-between items-start">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </div>

            <div className="px-4 pb-4">
              <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">
                Description
              </h4>
              {descriptionContent}
            </div>

            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
