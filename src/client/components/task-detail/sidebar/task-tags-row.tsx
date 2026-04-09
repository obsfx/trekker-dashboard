'use client';

import { DetailRow } from '@/components/task-detail/sidebar/detail-row';
import { Badge } from '@/components/ui/badge';

interface TaskTagsRowProps {
  tags: string[];
}

export function TaskTagsRow({ tags }: TaskTagsRowProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <DetailRow label="Tags" stacked>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </DetailRow>
  );
}
