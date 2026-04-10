'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CommentComposerProps {
  author: string;
  content: string;
  isSubmitting: boolean;
  onAuthorChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
}

export function CommentComposer({
  author,
  content,
  isSubmitting,
  onAuthorChange,
  onContentChange,
  onSubmit,
}: CommentComposerProps) {
  const isDisabled = isSubmitting || !author.trim() || !content.trim();

  return (
    <div className="space-y-2">
      <Input
        placeholder="Your name"
        value={author}
        onChange={(event) => onAuthorChange(event.target.value)}
      />
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        rows={2}
      />
      <Button
        size="sm"
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        loading={isSubmitting}
        loadingText="Adding Comment"
      >
        Add Comment
      </Button>
    </div>
  );
}
