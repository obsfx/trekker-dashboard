import { Progress } from '@/components/ui/progress';
import {
  FULL_PERCENTAGE,
  SUBTASK_PROGRESS_COMPLETE_THRESHOLD,
  SUBTASK_PROGRESS_GOOD_THRESHOLD,
  SUBTASK_PROGRESS_WARNING_THRESHOLD,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SubtaskProgressProps {
  completed: number;
  total: number;
}

export function SubtaskProgress({ completed, total }: SubtaskProgressProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * FULL_PERCENTAGE);

  const getColorClass = (pct: number): string => {
    if (pct === SUBTASK_PROGRESS_COMPLETE_THRESHOLD) return '[&>div]:bg-green-500';
    if (pct >= SUBTASK_PROGRESS_GOOD_THRESHOLD) return '[&>div]:bg-blue-500';
    if (pct >= SUBTASK_PROGRESS_WARNING_THRESHOLD) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <Progress value={percentage} className={cn('flex-1 h-1.5', getColorClass(percentage))} />
      <span className="font-mono text-xs text-muted-foreground">
        {completed}/{total}
      </span>
    </div>
  );
}
