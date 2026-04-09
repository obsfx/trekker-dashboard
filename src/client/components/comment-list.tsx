'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/date';
import type { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  onDelete: (commentId: string) => void;
}

export function CommentList({ comments, loading, onDelete }: CommentListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="group relative bg-muted/50 p-3">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
