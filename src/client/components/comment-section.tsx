'use client';

import { CommentComposer } from '@/components/comment-composer';
import { CommentList } from '@/components/comment-list';
import { useTaskComments } from '@/components/use-task-comments';

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const {
    author,
    comments,
    content,
    deleteComment,
    isSubmitting,
    loading,
    setAuthor,
    setContent,
    submitComment,
  } = useTaskComments(taskId);

  return (
    <div className="p-4 mt-4 border-t">
      <h4 className="text-sm font-medium mb-3">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h4>

      <CommentList comments={comments} loading={loading} onDelete={deleteComment} />

      <CommentComposer
        author={author}
        content={content}
        isSubmitting={isSubmitting}
        onAuthorChange={setAuthor}
        onContentChange={setContent}
        onSubmit={() => {
          void submitComment();
        }}
      />
    </div>
  );
}
