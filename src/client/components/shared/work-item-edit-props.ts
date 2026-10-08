import type { FieldValues, UseFormReturn } from 'react-hook-form';

import type { BreadcrumbItem } from '@/components/breadcrumb';

export interface WorkItemEditProps<TData extends FieldValues> {
  form: UseFormReturn<TData>;
  breadcrumbItems: BreadcrumbItem[];
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (data: TData) => Promise<boolean | undefined>;
  onCancel: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function closeAfterSuccessfulSubmit<TData>(
  onSubmit: (data: TData) => Promise<boolean | undefined>,
  onClose: () => void
) {
  return async (data: TData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };
}
