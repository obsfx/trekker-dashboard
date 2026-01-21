"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, SquareCheck, GitBranch } from "lucide-react";
import { CreateForm } from "./create-form";
import { useCreateForm } from "./use-create-form";
import type { CreateType, Epic, Task } from "@/types";

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  epics: Epic[];
  tasks: Task[];
  defaultStatus?: string;
  defaultType?: CreateType;
}

const TYPE_OPTIONS = [
  { value: "epic", label: "Epic", icon: Layers },
  { value: "task", label: "Task", icon: SquareCheck },
  { value: "subtask", label: "Subtask", icon: GitBranch },
] as const;

export function CreateModal({
  open,
  onClose,
  onCreated,
  epics,
  tasks,
  defaultStatus,
  defaultType,
}: CreateDrawerProps) {
  const [type, setType] = useState<CreateType>("task");
  const parentTasks = tasks.filter((t) => !t.parentTaskId);

  const { form, isSubmitting, handleSubmit } = useCreateForm({
    type,
    defaultStatus,
    onClose,
    onCreated,
  });

  useEffect(() => {
    if (open) {
      setType(defaultType || "task");
    }
  }, [open, defaultType]);

  const Icon = TYPE_OPTIONS.find((t) => t.value === type)?.icon || SquareCheck;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="p-0 flex flex-col w-full sm:max-w-md gap-0"
      >
        <SheetHeader className="shrink-0 border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Create New {type.charAt(0).toUpperCase() + type.slice(1)}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0" showScrollbar>
          <form
            id="create-form"
            onSubmit={handleSubmit}
            className="p-4 space-y-4"
          >
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as CreateType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(({ value, label, icon: TypeIcon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CreateForm
              key={type}
              form={form}
              type={type}
              epics={epics}
              parentTasks={parentTasks}
            />
          </form>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t p-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
