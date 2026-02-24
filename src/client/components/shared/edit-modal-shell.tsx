"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem } from "@/components/breadcrumb";
import { DeleteConfirmation } from "./delete-confirmation";

interface EditModalShellProps {
  open: boolean;
  onClose: () => void;
  breadcrumbItems: BreadcrumbItem[];
  formId: string;
  isSubmitting: boolean;
  isDeleting: boolean;
  entityName: string;
  onCancel: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  children: React.ReactNode;
}

export function EditModalShell({
  open,
  onClose,
  breadcrumbItems,
  formId,
  isSubmitting,
  isDeleting,
  entityName,
  onCancel,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
  children,
}: EditModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="flex items-center border-b p-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">{children}</div>

        <div className="p-4 border-t flex items-center justify-between">
          <DeleteConfirmation
            isConfirming={isDeleting}
            entityName={entityName}
            onDelete={onDelete}
            onConfirm={onDeleteConfirm}
            onCancel={onDeleteCancel}
          />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
