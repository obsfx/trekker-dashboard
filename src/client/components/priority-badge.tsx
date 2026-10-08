import { Badge } from '@/components/ui/badge';
import {
  DEFAULT_PRIORITY,
  FALLBACK_BADGE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from '@/lib/constants';

interface PriorityBadgeProps {
  priority: number;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style =
    PRIORITY_STYLES.get(priority) ?? PRIORITY_STYLES.get(DEFAULT_PRIORITY) ?? FALLBACK_BADGE_COLORS;

  return (
    <Badge
      className="font-mono text-xs"
      title={PRIORITY_LABELS.get(priority)}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      P{priority}
    </Badge>
  );
}
